import { Logger } from './Logger';
import { ConsoleLogger } from './ConsoleLogger';

export interface MonitoringServiceConstructorParams {
  serviceName: string;
  serviceVersion: string;
  serviceEnv: string;
  authToken: string;
}

export abstract class MonitoringService {
  abstract initRemoteLogger(
    authToken: string,
    serviceName: string,
    serviceVersion: string,
    serviceEnv: string,
  ): Logger;

  private logger: Logger;
  constructor(
    remoteMonitoringServiceParams?: MonitoringServiceConstructorParams,
  ) {
    const { serviceName, serviceVersion, serviceEnv, authToken } =
      remoteMonitoringServiceParams ?? {};

    if (serviceName && serviceVersion && serviceEnv && authToken) {
      this.logger = this.initRemoteLogger(
        authToken,
        serviceName,
        serviceVersion,
        serviceEnv,
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
    this.logger.error(error.name, context, error);
  }
}
