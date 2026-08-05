import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

@Schema({ versionKey: false })
export class ReservationDocument extends AbstractDocument {
  @Prop()
  timestamp: Date;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  userId: string;

  @Prop()
  amount: number;

  @Prop({ default: 'pending' })
  status: ReservationStatus;

  @Prop()
  checkoutSessionId?: string;

  @Prop()
  invoiceId?: string;
}

export const ReservationSchema =
  SchemaFactory.createForClass(ReservationDocument);
