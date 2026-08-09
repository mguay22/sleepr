import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CheckoutSessionCreated,
  PaymentFailedDto,
  PaymentSucceededDto,
  PAYMENTS_SERVICE,
  UserDto,
} from '@app/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationsRepository } from './reservations.repository';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private readonly reservationsRepository: ReservationsRepository,
    @Inject(PAYMENTS_SERVICE) private readonly paymentsService: ClientProxy,
  ) {}

  async create(createReservationDto: CreateReservationDto, user: UserDto) {
    // A card in the request selects the legacy synchronous charge flow;
    // without one, payment happens on a hosted Stripe Checkout page.
    if (createReservationDto.charge.card) {
      return this.createWithDirectCharge(createReservationDto, user);
    }
    return this.createWithCheckoutSession(createReservationDto, user);
  }

  // Legacy flow: charge the card inline, then persist a confirmed reservation
  private async createWithDirectCharge(
    { charge, ...createReservationDto }: CreateReservationDto,
    { email, _id: userId }: UserDto,
  ) {
    const paymentIntent = await lastValueFrom(
      this.paymentsService.send<{ id: string }>('create_charge', {
        ...charge,
        email,
      }),
    );

    return this.reservationsRepository.create({
      ...createReservationDto,
      amount: charge.amount,
      invoiceId: paymentIntent.id,
      timestamp: new Date(),
      userId,
      status: 'confirmed',
    });
  }

  // Improved flow: pending reservation + Checkout Session, confirmed via webhook
  private async createWithCheckoutSession(
    { charge, ...createReservationDto }: CreateReservationDto,
    { email, _id: userId }: UserDto,
  ) {
    const reservation = await this.reservationsRepository.create({
      ...createReservationDto,
      amount: charge.amount,
      timestamp: new Date(),
      userId,
      status: 'pending',
    });

    try {
      const session = await lastValueFrom(
        this.paymentsService.send<CheckoutSessionCreated>(
          'create_checkout_session',
          {
            amount: charge.amount,
            email,
            reservationId: reservation._id.toHexString(),
          },
        ),
      );

      const updatedReservation =
        await this.reservationsRepository.findOneAndUpdate(
          { _id: reservation._id },
          { $set: { checkoutSessionId: session.id } },
        );

      return { ...updatedReservation, paymentUrl: session.url };
    } catch (err) {
      await this.reservationsRepository.findOneAndDelete({
        _id: reservation._id,
      });
      throw err;
    }
  }

  async handlePaymentSucceeded({
    reservationId,
    paymentIntentId,
  }: PaymentSucceededDto) {
    this.logger.log(`Payment succeeded for reservation ${reservationId}`);
    try {
      await this.reservationsRepository.findOneAndUpdate(
        { _id: reservationId },
        { $set: { status: 'confirmed', invoiceId: paymentIntentId } },
      );
    } catch (err) {
      if (!(err instanceof NotFoundException)) {
        throw err;
      }
      this.logger.warn(
        `Received payment for unknown reservation ${reservationId}`,
      );
    }
  }

  async handlePaymentFailed({ reservationId, reason }: PaymentFailedDto) {
    this.logger.warn(
      `Payment failed for reservation ${reservationId}: ${reason}`,
    );
    try {
      await this.reservationsRepository.findOneAndUpdate(
        { _id: reservationId, status: 'pending' },
        { $set: { status: 'cancelled' } },
      );
    } catch (err) {
      // already confirmed or deleted - nothing to cancel
      if (!(err instanceof NotFoundException)) {
        throw err;
      }
    }
  }

  async findAll() {
    return this.reservationsRepository.find({});
  }

  async findOne(_id: string) {
    return this.reservationsRepository.findOne({ _id });
  }

  async update(_id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationsRepository.findOneAndUpdate(
      { _id },
      { $set: updateReservationDto },
    );
  }

  async remove(_id: string) {
    return this.reservationsRepository.findOneAndDelete({ _id });
  }
}
