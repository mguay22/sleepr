import {
  IsArray,
  IsEmail,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';
import { RoleDto } from './role.dto';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsArray()
  roles?: RoleDto[];
}
