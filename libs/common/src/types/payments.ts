/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export interface CreateChargeResponse {
  id: string;
}

export interface CreateChargeMessage {
  email: string;
  amount: number;
  card: CardMessage | undefined;
}

export interface CardMessage {
  cvc: string;
  expMonth: number;
  expYear: number;
  number: string;
}

export const PAYMENTS_PACKAGE_NAME = 'payments';

export interface PaymentsServiceClient {
  createCharge(request: CreateChargeMessage): Observable<CreateChargeResponse>;
}

export interface PaymentsServiceController {
  createCharge(
    request: CreateChargeMessage,
  ):
    | Promise<CreateChargeResponse>
    | Observable<CreateChargeResponse>
    | CreateChargeResponse;
}

export function PaymentsServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ['createCharge'];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod('PaymentsService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcStreamMethod('PaymentsService', method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const PAYMENTS_SERVICE_NAME = 'PaymentsService';
