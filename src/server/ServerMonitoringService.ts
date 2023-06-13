import 'pino-datadog-transport';
import deepMerge from 'deepmerge';
import pino, { LoggerOptions, TransportBaseOptions } from 'pino';

import {
  MonitoringService,
  RemoteMonitoringServiceParams,
} from '../shared/MonitoringService';
import { ConsoleLogger } from '../shared/ConsoleLogger';

import { getLoggingFunction } from './getLoggingFunction';
import { PinoWrapper } from './PinoWrapper';

interface UnknownLogger {
  log?(...parts: unknown[]): void;

  debug?(...parts: unknown[]): void;

  info(...parts: unknown[]): void;

  warn(...parts: unknown[]): void;

  error(...parts: unknown[]): void;
}

interface RemoteMonitoringServiceConfig {
  transportOptions?: Partial<TransportBaseOptions>;
  loggerOptions?: Partial<LoggerOptions>;
}

export class ServerMonitoringService extends MonitoringService {
  constructor(
    remoteMonitoringServiceParams?: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig?: RemoteMonitoringServiceConfig,
  ) {
    super(remoteMonitoringServiceParams, remoteMonitoringServiceConfig);
  }

  initRemoteLogger(
    remoteMonitoringServiceParams: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig: RemoteMonitoringServiceConfig = {},
  ) {
    const { serviceName, serviceVersion, serviceEnv, authToken } =
      remoteMonitoringServiceParams ?? {};
    const {
      transportOptions: overriddenTransportOptions,
      loggerOptions: overriddenLoggerOptions,
    } = remoteMonitoringServiceConfig;

    const defaultTransportOptions = {
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
    };
    const finalTransportOptions = deepMerge(
      defaultTransportOptions,
      overriddenTransportOptions ?? {},
    );
    const transport = pino.transport(finalTransportOptions);

    const defaultLoggerOptions = {
      level: 'info',
      exitOnError: false,
    };
    const finalLoggerOptions = deepMerge(
      defaultLoggerOptions,
      overriddenLoggerOptions ?? {},
    );
    const pinoLogger = pino(finalLoggerOptions, transport);

    return new PinoWrapper(pinoLogger);
  }

  overrideLogger(unknownLogger: UnknownLogger) {
    /**
     * Monkey-patch global console.log logger. Yes. Sigh.
     * @type {string[]}
     */
    const loggingProperties = [
      'debug',
      'info',
      'log',
      'warn',
      'error',
    ] as const;

    for (const property of loggingProperties) {
      if (Object.hasOwn(unknownLogger, property)) {
        unknownLogger[property] = getLoggingFunction(property, this.logger);
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
