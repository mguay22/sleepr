import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentIntent {
  @Field()
  id: string;

  @Field()
  amount: number;
}
