import { INestApplication } from '@nestjs/common';

let app: INestApplication;

const setApp = (_app: INestApplication) => {
  app = _app;
};

export { app, setApp };
