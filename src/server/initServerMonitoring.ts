import { RemoteMonitoringServiceParams } from '../shared/RemoteMonitoringServiceParams';

import {
  RemoteMonitoringServiceConfig,
  ServerMonitoringService,
} from './ServerMonitoringService';

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
  remoteMonitoringServiceConfig?: RemoteMonitoringServiceConfig,
): ServerMonitoringService => {
  const {
    shouldOverrideNativeConsole = defaultMonitoringOptions.shouldOverrideNativeConsole,
    shouldCatchProcessErrors = defaultMonitoringOptions.shouldCatchProcessErrors,
    globalMonitoringInstanceName = defaultMonitoringOptions.globalMonitoringInstanceName,
  } = monitoringOptions ?? defaultMonitoringOptions;
  const serverMonitoring = new ServerMonitoringService(
    remoteMonitoringServiceParams,
    remoteMonitoringServiceConfig,
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
