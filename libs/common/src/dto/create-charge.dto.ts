import { Type } from 'class-transformer';
import {
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { CardDto } from './card.dto';

export class CreateChargeDto {
  // Optional: provide a card to charge it directly (legacy flow).
  // Omit it to pay via a Stripe Checkout Session instead.
  @IsOptional()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CardDto)
  card?: CardDto;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;
}
