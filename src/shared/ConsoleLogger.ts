import { Logger } from './Logger';

export class ConsoleLogger implements Logger {
  debug(...args: [message: string, context?: object]) {
    // eslint-disable-next-line no-console
    console.debug(...args);
  }

  info(...args: [message: string, context?: object]) {
    // eslint-disable-next-line no-console
    console.info(...args);
  }

  warn(...args: [message: string, context?: object]) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }

  error(...args: [message: string, context?: object, error?: Error]) {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
}
