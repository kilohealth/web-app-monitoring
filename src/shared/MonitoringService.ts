import { Logger } from './Logger';
import { ConsoleLogger } from './ConsoleLogger';

export interface RemoteMonitoringServiceParams {
  serviceName?: string;
  serviceVersion?: string;
  serviceEnv?: string;
  authToken?: string;
}

export abstract class MonitoringService {
  abstract initRemoteLogger(
    remoteMonitoringServiceParams: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig?: unknown,
  ): Logger;

  logger: Logger;
  constructor(
    remoteMonitoringServiceParams?: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig?: unknown,
  ) {
    const { serviceName, serviceVersion, serviceEnv, authToken } =
      remoteMonitoringServiceParams ?? {};

    if (serviceName && serviceVersion && serviceEnv && authToken) {
      this.logger = this.initRemoteLogger(
        {
          authToken,
          serviceName,
          serviceVersion,
          serviceEnv,
        },
        remoteMonitoringServiceConfig,
      );
    } else {
      this.logger = new ConsoleLogger();

      if (remoteMonitoringServiceParams) {
        this.logger.warn(
          '[MonitoringService] can not initialize remote monitoring service, because some variables are missing. Initializing with console instead',
        );
        this.logger.warn(`
        serviceName - ${serviceName}
        serviceVersion - ${serviceVersion}
        serviceEnv - ${serviceEnv}
        authToken - ${authToken}
      `);
      }
    }
  }

  debug(...args: [message: string, context?: object]) {
    this.logger.debug(...args);
  }

  info(...args: [message: string, context?: object]) {
    this.logger.info(...args);
  }

  warn(...args: [message: string, context?: object]) {
    this.logger.warn(...args);
  }

  error(...args: [message: string, context?: object, error?: Error]) {
    this.logger.error(...args);
  }

  reportError(error: Error, context?: object) {
    this.logger.error(error.message, context, error);
  }
}
