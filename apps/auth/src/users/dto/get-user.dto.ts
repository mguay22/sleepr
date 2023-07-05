import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserDto {
  @IsString()
  @IsNotEmpty()
  @Type(() => Number)
  id: number;
}
