import { datadogLogs } from '@datadog/browser-logs';

import { MonitoringService } from '../shared/MonitoringService';

const ddLogger = datadogLogs.logger;

export class BrowserMonitoringService extends MonitoringService {
  initRemoteLogger(
    clientToken: string,
    serviceName: string,
    serviceVersion: string,
    serviceEnv: string,
  ) {
    datadogLogs.init({
      clientToken,
      service: serviceName,
      version: serviceVersion,
      env: serviceEnv,
      forwardConsoleLogs: 'all',
    });

    return ddLogger;
  }
}
