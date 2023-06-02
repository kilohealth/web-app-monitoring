import { datadogLogs } from '@datadog/browser-logs';
import { LogsInitConfiguration } from '@datadog/browser-logs/src/domain/configuration';

import {
  MonitoringService,
  RemoteMonitoringServiceParams,
} from '../shared/MonitoringService';

const ddLogger = datadogLogs.logger;

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
