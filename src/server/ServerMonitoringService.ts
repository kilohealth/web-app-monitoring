import pino from 'pino';

import { MonitoringService } from '../shared/MonitoringService';
import { Logger } from '../shared/Logger';

import { getLoggingFunction } from './getLoggingFunction';

interface UnknownLogger {
  log(...parts: unknown[]): void;

  debug(...parts: unknown[]): void;

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

    const logger = pino({
      level: 'info',
      exitOnError: false,
      transport,
    });

    this.overrideNativeConsole(logger);
    this.catchNativeProcessErrors(logger);

    return logger;
  }

  overrideLogger(existingLogger: UnknownLogger, newLogger: Logger) {
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
      if (property === 'log') {
        existingLogger.log = getLoggingFunction('info', newLogger);
      } else if (Object.keys(existingLogger).includes(property)) {
        existingLogger[property] = getLoggingFunction(property, newLogger);
      }
    }
  }

  // we need this method to override external console, for example next console
  // Monkey-patch Next.js logger.
  // See https://github.com/atkinchris/next-logger/blob/main/index.js
  // See https://github.com/vercel/next.js/blob/canary/packages/next/build/output/log.ts
  private overrideNativeConsole(logger: Logger) {
    this.overrideLogger(console, logger);
  }

  private catchNativeProcessErrors(logger: Logger) {
    // Add general error logging.
    process.on('unhandledRejection', (error: Error) => {
      logger.error('unhandledRejection', undefined, error);
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error('uncaughtException', undefined, error);
    });
  }
}
