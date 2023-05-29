import 'pino-datadog-transport';
import pino from 'pino';

import { MonitoringService } from '../shared/MonitoringService';
import { ConsoleLogger } from '../shared/ConsoleLogger';

import { getLoggingFunction } from './getLoggingFunction';

interface UnknownLogger {
  log?(...parts: unknown[]): void;

  debug?(...parts: unknown[]): void;

  info(...parts: unknown[]): void;

  warn(...parts: unknown[]): void;

  error(...parts: unknown[]): void;
}

export class ServerMonitoringService extends MonitoringService {
  initRemoteLogger(
    authToken: string,
    serviceName: string,
    serviceVersion: string,
    serviceEnv: string,
  ) {
    const transport = pino.transport({
      target: 'pino-datadog-transport',
      options: {
        service: serviceName,
        // strange that for client these are done under the hood, and for server logging
        // we have to do this manually
        ddtags: `env:${serviceEnv},version:${serviceVersion}`,
        // https://github.com/theogravity/pino-datadog-transport#configuration-options
        ddClientConf: {
          authMethods: {
            apiKeyAuth: authToken,
          },
        },
      },
    });

    const logger = pino(
      {
        level: 'info',
        exitOnError: false,
      },
      transport,
    );

    return logger;
  }

  overrideLogger(unknownLogger: UnknownLogger) {
    /**
     * Monkey-patch global console.log logger. Yes. Sigh.
     * @type {string[]}
     */
    const loggingProperties = [
      'log',
      'debug',
      'info',
      'warn',
      'error',
    ] as const;

    for (const property of loggingProperties) {
      if (Object.hasOwn(unknownLogger, property)) {
        unknownLogger[property] = getLoggingFunction(property, this.logger);
      } else if (typeof unknownLogger[property] === 'function') {
        unknownLogger[property] = getLoggingFunction('info', this.logger);
      }
    }
  }

  overrideNativeConsole() {
    if (this.logger instanceof ConsoleLogger) {
      this.logger.warn(
        "[ServerMonitoringService] can't override native console, because was initialized with it",
      );

      return;
    }

    this.overrideLogger(console);
  }

  catchProcessErrors() {
    if (this.logger instanceof ConsoleLogger) {
      this.logger.warn(
        "[ServerMonitoringService] can't override native process error, because was initialized with default console",
      );

      return;
    }

    process.on('unhandledRejection', (error: Error) => {
      this.logger.error('unhandledRejection', undefined, error);
    });

    process.on('uncaughtException', (error: Error) => {
      this.logger.error('uncaughtException', undefined, error);
    });
  }
}
