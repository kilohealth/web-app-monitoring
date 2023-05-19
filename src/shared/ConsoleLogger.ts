import { Logger } from './Logger';

export class ConsoleLogger implements Logger {
  debug(message: string, context?: object) {
    console.debug(message, context);
  }

  info(message: string, context?: object) {
    console.info(message, context);
  }

  warn(message: string, context?: object) {
    console.warn(message, context);
  }

  error(message: string, context?: object, error?: Error) {
    console.error(message, context, error);
  }
}
