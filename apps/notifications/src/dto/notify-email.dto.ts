import { IsEmail } from 'class-validator';

export class NotifyEmailDto {
  @IsEmail()
  email: string;
}
