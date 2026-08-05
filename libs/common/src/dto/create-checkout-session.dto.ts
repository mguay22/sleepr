import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  reservationId: string;
}

export interface CheckoutSessionCreated {
  id: string;
  url: string;
}
