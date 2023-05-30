import { BaseLogger } from 'pino';

import { Logger } from '../shared/Logger';

export class PinoWrapper implements Logger {
  private pinoLogger: BaseLogger;

  constructor(pinoLogger: BaseLogger) {
    this.pinoLogger = pinoLogger;
  }

  debug(message: string, context?: object) {
    if (context === undefined) {
      this.pinoLogger.debug(message);
    } else {
      this.pinoLogger.debug(context, message);
    }
  }

  info(message: string, context?: object) {
    if (context === undefined) {
      this.pinoLogger.info(message);
    } else {
      this.pinoLogger.info(context, message);
    }
  }

  warn(message: string, context?: object) {
    if (context === undefined) {
      this.pinoLogger.warn(message);
    } else {
      this.pinoLogger.warn(context, message);
    }
  }

  error(message: string, context?: object, error?: Error) {
    this.pinoLogger.error(
      {
        ...context,
        err: error,
      },
      message,
    );
  }
}
