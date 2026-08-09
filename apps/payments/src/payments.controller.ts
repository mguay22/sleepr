import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateCheckoutSessionDto } from '@app/common';
import { PaymentsService } from './payments.service';
import { PaymentsCreateChargeDto } from './dto/payments-create-charge.dto';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // Legacy flow: synchronous direct card charge
  @MessagePattern('create_charge')
  @UsePipes(new ValidationPipe())
  async createCharge(@Payload() data: PaymentsCreateChargeDto) {
    return this.paymentsService.createCharge(data);
  }

  // Improved flow: Stripe Checkout Session + webhook confirmation
  @MessagePattern('create_checkout_session')
  @UsePipes(new ValidationPipe())
  async createCheckoutSession(@Payload() data: CreateCheckoutSessionDto) {
    return this.paymentsService.createCheckoutSession(data);
  }
}
