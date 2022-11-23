import { Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
