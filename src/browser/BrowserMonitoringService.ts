import type { LogsInitConfiguration } from '@datadog/browser-logs';
import { datadogLogs } from '@datadog/browser-logs';

import type { RemoteMonitoringServiceParams } from '../shared/MonitoringService';
import { MonitoringService } from '../shared/MonitoringService';

type RemoteMonitoringServiceConfig = Partial<LogsInitConfiguration>;

export class BrowserMonitoringService extends MonitoringService {
  constructor(
    remoteMonitoringServiceParams?: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig?: RemoteMonitoringServiceConfig,
  ) {
    super(remoteMonitoringServiceParams, remoteMonitoringServiceConfig);
  }

  initRemoteLogger(
    remoteMonitoringServiceParams: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig?: RemoteMonitoringServiceConfig,
  ) {
    const { serviceName, serviceVersion, serviceEnv, authToken } =
      remoteMonitoringServiceParams ?? {};
    const ddLogger = datadogLogs.logger;
    datadogLogs.init({
      clientToken: authToken ?? '',
      service: serviceName,
      version: serviceVersion,
      env: serviceEnv,
      forwardConsoleLogs: 'all',
      ...remoteMonitoringServiceConfig,
    });

    return ddLogger;
  }
}
