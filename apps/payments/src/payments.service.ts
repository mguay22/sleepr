import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CheckoutSessionCreated,
  CreateCheckoutSessionDto,
  NOTIFICATIONS_SERVICE,
  PAYMENT_FAILED_EVENT,
  PAYMENT_SUCCEEDED_EVENT,
  RESERVATIONS_SERVICE,
} from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { PaymentsCreateChargeDto } from './dto/payments-create-charge.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly stripe = new Stripe(
    this.configService.getOrThrow('STRIPE_SECRET_KEY'),
  );

  constructor(
    private readonly configService: ConfigService,
    @Inject(NOTIFICATIONS_SERVICE)
    private readonly notificationsService: ClientProxy,
    @Inject(RESERVATIONS_SERVICE)
    private readonly reservationsService: ClientProxy,
  ) {}

  // Legacy flow: charge a raw card synchronously. Kept as the course's
  // original implementation - prefer createCheckoutSession for new work.
  async createCharge({ card, amount, email }: PaymentsCreateChargeDto) {
    const paymentMethod = await this.stripe.paymentMethods.create({
      type: 'card',
      card,
    });

    const paymentIntent = await this.stripe.paymentIntents.create({
      payment_method: paymentMethod.id,
      amount: Math.round(amount * 100),
      confirm: true,
      payment_method_types: ['card'],
      currency: 'usd',
    });

    this.notificationsService.emit('notify_email', {
      email,
      text: `Your payment of $${amount} has completed successfully.`,
    });

    return paymentIntent;
  }

  async createCheckoutSession({
    amount,
    email,
    reservationId,
  }: CreateCheckoutSessionDto): Promise<CheckoutSessionCreated> {
    const session = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(amount * 100),
              product_data: {
                name: 'Sleepr Reservation',
              },
            },
          },
        ],
        customer_email: email,
        client_reference_id: reservationId,
        metadata: { reservationId },
        success_url: this.configService.getOrThrow('STRIPE_SUCCESS_URL'),
        cancel_url: this.configService.getOrThrow('STRIPE_CANCEL_URL'),
      },
      { idempotencyKey: `checkout-session-${reservationId}` },
    );
    return { id: session.id, url: session.url };
  }

  constructEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET'),
    );
  }

  handleEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        // completed fires even for unpaid async payment methods -
        // async_payment_succeeded covers those once they settle
        if (session.payment_status !== 'unpaid') {
          this.handlePaymentSucceeded(session);
        }
        break;
      }
      case 'checkout.session.async_payment_failed':
      case 'checkout.session.expired': {
        this.handlePaymentFailed(event.data.object, event.type);
        break;
      }
      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private handlePaymentSucceeded(session: Stripe.Checkout.Session) {
    const reservationId = session.metadata?.reservationId;
    if (!reservationId) {
      this.logger.warn(
        `Checkout session ${session.id} completed without a reservationId`,
      );
      return;
    }

    this.reservationsService.emit(PAYMENT_SUCCEEDED_EVENT, {
      reservationId,
      paymentIntentId: session.payment_intent as string,
    });

    const email = session.customer_details?.email ?? session.customer_email;
    if (email) {
      this.notificationsService.emit('notify_email', {
        email,
        text: `Your payment of $${(session.amount_total ?? 0) / 100} has completed successfully.`,
      });
    }
  }

  private handlePaymentFailed(
    session: Stripe.Checkout.Session,
    reason: string,
  ) {
    const reservationId = session.metadata?.reservationId;
    if (!reservationId) {
      return;
    }
    this.reservationsService.emit(PAYMENT_FAILED_EVENT, {
      reservationId,
      reason,
    });
  }
}
