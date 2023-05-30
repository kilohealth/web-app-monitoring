import { RemoteMonitoringServiceParams } from '../shared/MonitoringService';

import { ServerMonitoringService } from './ServerMonitoringService';

const defaultMonitoringOptions = {
  shouldOverrideNativeConsole: false,
  shouldCatchProcessErrors: false,
  globalMonitoringInstanceName: '',
};

interface MonitoringOptions {
  shouldOverrideNativeConsole?: boolean;
  shouldCatchProcessErrors?: boolean;
  globalMonitoringInstanceName?: string;
}

export const initServerMonitoring = (
  remoteMonitoringServiceParams?: RemoteMonitoringServiceParams,
  monitoringOptions?: MonitoringOptions,
): ServerMonitoringService => {
  const {
    shouldOverrideNativeConsole = defaultMonitoringOptions.shouldOverrideNativeConsole,
    shouldCatchProcessErrors = defaultMonitoringOptions.shouldCatchProcessErrors,
    globalMonitoringInstanceName = defaultMonitoringOptions.globalMonitoringInstanceName,
  } = monitoringOptions ?? defaultMonitoringOptions;
  const serverMonitoring = new ServerMonitoringService(
    remoteMonitoringServiceParams,
  );

  if (shouldOverrideNativeConsole) {
    serverMonitoring.overrideNativeConsole();
  }

  if (shouldCatchProcessErrors) {
    serverMonitoring.catchProcessErrors();
  }

  if (globalMonitoringInstanceName) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any)[globalMonitoringInstanceName] = serverMonitoring;
  }

  return serverMonitoring;
};
