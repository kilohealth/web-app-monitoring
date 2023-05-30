import { datadogLogs } from '@datadog/browser-logs';
import { LogsInitConfiguration } from '@datadog/browser-logs/src/domain/configuration';

import {
  MonitoringService,
  RemoteMonitoringServiceParams,
} from '../shared/MonitoringService';

const ddLogger = datadogLogs.logger;

export class BrowserMonitoringService extends MonitoringService {
  initRemoteLogger(
    remoteMonitoringServiceParams: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig?: LogsInitConfiguration,
  ) {
    const { serviceName, serviceVersion, serviceEnv, authToken } =
      remoteMonitoringServiceParams ?? {};
    datadogLogs.init({
      clientToken: authToken,
      service: serviceName,
      version: serviceVersion,
      env: serviceEnv,
      forwardConsoleLogs: 'all',
      ...remoteMonitoringServiceConfig,
    });

    return ddLogger;
  }
}
