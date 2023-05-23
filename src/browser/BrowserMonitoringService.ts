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

  setupReportingNativeLogs() {
    if (!this.remoteMonitoringServiceParams) {
      this.reportError(
        new Error('Can not setup remote monitoring without all needed params'),
      );

      return;
    }

    datadogLogs.init({
      clientToken: this.remoteMonitoringServiceParams.clientToken,
      service: this.remoteMonitoringServiceParams.serviceName,
      version: this.remoteMonitoringServiceParams.serviceVersion,
      env: this.remoteMonitoringServiceParams.serviceEnv,
      // TODO: think about below
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
    });
  }

  info(...args: [message: string, context?: object]) {
    this.logger.info(...args);
  }

  reportError(error: Error, context?: object) {
    this.logger.error(error.name, context, error);
  }
}
