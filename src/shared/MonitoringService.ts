import { UserContext } from '../browser/UserContext';
import { LocalUserContext } from '../browser/LocalUserContext';

import { Logger, LogLevel } from './Logger';
import { ConsoleLogger } from './ConsoleLogger';
import { RemoteMonitoringServiceParams } from './RemoteMonitoringServiceParams';
import { userSymbol } from './userSymbol';

export abstract class MonitoringService {
  abstract initRemoteMonitoring(
    remoteMonitoringServiceParams: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig?: unknown,
  ): { logger: Logger; userContext: UserContext };

  logger: Logger;

  userContext: UserContext;

  constructor(
    remoteMonitoringServiceParams?: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig?: unknown,
  ) {
    const { serviceName, serviceVersion, serviceEnv, authToken } =
      remoteMonitoringServiceParams ?? {};

    if (serviceName && serviceVersion && serviceEnv && authToken) {
      const { logger, userContext } = this.initRemoteMonitoring(
        remoteMonitoringServiceParams as RemoteMonitoringServiceParams,
        remoteMonitoringServiceConfig,
      );
      this.logger = logger;
      this.userContext = userContext;
    } else {
      this.userContext = new LocalUserContext();
      this.logger = new ConsoleLogger();

      if (remoteMonitoringServiceParams) {
        this.logger.warn(
          '[MonitoringService] can not initialize remote monitoring service, because some variables are missing. Initializing with console instead',
        );
        this.logger.warn(`
        serviceName - ${remoteMonitoringServiceParams.serviceName}
        serviceVersion - ${remoteMonitoringServiceParams.serviceVersion}
        serviceEnv - ${remoteMonitoringServiceParams.serviceEnv}
        authToken - ${remoteMonitoringServiceParams.authToken}
      `);
      }
    }
  }

  log(
    level: LogLevel,
    ...args: [message: string, context?: object, error?: Error]
  ) {
    const user = this.userContext.getUser();

    if (user) {
      const [message, context, ...otherArgs] = args;
      this.logger[level](
        message,
        {
          [userSymbol]: user,
          ...context,
        },
        ...otherArgs,
      );
    } else {
      this.logger[level](...args);
    }
  }

  debug(...args: [message: string, context?: object]) {
    this.log('debug', ...args);
  }

  info(...args: [message: string, context?: object]) {
    this.log('info', ...args);
  }

  warn(...args: [message: string, context?: object]) {
    this.log('warn', ...args);
  }

  error(...args: [message: string, context?: object, error?: Error]) {
    this.log('error', ...args);
  }

  reportError(error: Error, context?: object) {
    this.error(error.message, context, error);
  }
}
