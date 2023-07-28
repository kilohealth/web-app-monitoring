import { datadogLogs } from '@datadog/browser-logs';
import { LogsInitConfiguration } from '@datadog/browser-logs/src/domain/configuration';

import { MonitoringService } from '../shared/MonitoringService';
import { RemoteMonitoringServiceParams } from '../shared/RemoteMonitoringServiceParams';

import { DatadogLoggerWrapper } from './DatadogLoggerWrapper';

type RemoteMonitoringServiceConfig = Partial<LogsInitConfiguration>;

export class BrowserMonitoringService extends MonitoringService {
  constructor(
    remoteMonitoringServiceParams?: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig?: RemoteMonitoringServiceConfig,
  ) {
    super(remoteMonitoringServiceParams, remoteMonitoringServiceConfig);
  }

  initRemoteMonitoring(
    remoteMonitoringServiceParams: RemoteMonitoringServiceParams,
    remoteMonitoringServiceConfig?: RemoteMonitoringServiceConfig,
  ) {
    const { serviceName, serviceVersion, serviceEnv, authToken } =
      remoteMonitoringServiceParams ?? {};
    const logger = new DatadogLoggerWrapper(datadogLogs.logger);
    datadogLogs.init({
      clientToken: authToken ?? '',
      service: serviceName,
      version: serviceVersion,
      env: serviceEnv,
      forwardConsoleLogs: 'all',
      ...remoteMonitoringServiceConfig,
    });

    return {
      logger,
      userContext: datadogLogs,
    };
  }
}
