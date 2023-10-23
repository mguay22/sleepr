import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        timestamp: () => {
          const now = new Date();
          const formattedDate = now.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          });
          const formattedTime = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
          });
          return `, "time":"${formattedDate}, ${formattedTime}"`;
        },
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
            levelFirst: true,
            colorize: true,
            translateTime: true,
            messageFormat: '[Pino] {pid}  - {time}     {msg}',
            ignore: 'time,level,pid,hostname',
            customLevels: {
              trace: 'gray',
              debug: 'cyan',
              info: 'green',
              warn: 'yellow',
              error: 'red',
            },
          },
        },
      },
    }),


  ],
})
export class LoggerModule { }
