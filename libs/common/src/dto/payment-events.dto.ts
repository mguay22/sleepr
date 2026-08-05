import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const PAYMENT_SUCCEEDED_EVENT = 'payment_succeeded';
export const PAYMENT_FAILED_EVENT = 'payment_failed';

export class PaymentSucceededDto {
  @IsString()
  @IsNotEmpty()
  reservationId: string;

  @IsString()
  @IsOptional()
  paymentIntentId?: string;
}

export class PaymentFailedDto {
  @IsString()
  @IsNotEmpty()
  reservationId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
