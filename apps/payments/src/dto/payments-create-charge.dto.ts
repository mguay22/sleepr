import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmptyObject,
  ValidateNested,
} from 'class-validator';
import { CardDto, CreateChargeDto } from '@app/common';

export class PaymentsCreateChargeDto extends CreateChargeDto {
  // Unlike the base DTO, the direct-charge message always requires a card
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => CardDto)
  card: CardDto;

  @IsEmail()
  email: string;
}
