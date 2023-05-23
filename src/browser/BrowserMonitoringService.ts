import { datadogLogs } from '@datadog/browser-logs';

import { Logger } from '../shared/Logger';
import { ConsoleLogger } from '../shared/ConsoleLogger';

const ddLogger = datadogLogs.logger;

interface RemoteMonitoringServiceParams {
  serviceName: string;
  serviceVersion: string;
  serviceEnv: string;
  clientToken: string;
}

export class BrowserMonitoringService {
  private logger: Logger;
  private remoteMonitoringServiceParams?: RemoteMonitoringServiceParams;

  constructor(remoteMonitoringServiceParams?: RemoteMonitoringServiceParams) {
    this.remoteMonitoringServiceParams = remoteMonitoringServiceParams;

    const { serviceName, serviceVersion, serviceEnv, clientToken } =
      remoteMonitoringServiceParams ?? {};

    if (serviceName && serviceVersion && serviceEnv && clientToken) {
      datadogLogs.init({
        clientToken,
        service: serviceName,
        version: serviceVersion,
        env: serviceEnv,
        forwardConsoleLogs: 'all',
      });

      this.logger = ddLogger;
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
        clientToken - ${clientToken}
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
