import { datadogLogs } from '@datadog/browser-logs';

import { BrowserMonitoringService } from './BrowserMonitoringService';

jest.mock('@datadog/browser-logs', () => ({
  datadogLogs: {
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
    init: jest.fn(),
  },
}));

describe('BrowserMonitoringService', () => {
  describe('constructor', () => {
    let consoleInfoSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    });

    afterEach(() => {
      consoleInfoSpy.mockRestore();
    });

    it('initialize with console if no params provided', () => {
      const context = { key: 'value' };
      const browserMonitoringService = new BrowserMonitoringService();

      browserMonitoringService.info('test', context);
      expect(consoleInfoSpy).toHaveBeenCalledWith('test', context);
    });

    it('initialize with console if not enough params for remote logging provided', () => {
      const context = { key: 'value' };
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const browserMonitoringService = new BrowserMonitoringService({
        serviceName: 'serviceName',
        serviceEnv: 'serviceEnv',
        serviceVersion: 'serviceVersion',
        authToken: '',
      });

      browserMonitoringService.info('test', context);
      expect(consoleInfoSpy).toHaveBeenCalledWith('test', context);
      consoleWarnSpy.mockRestore();
    });

    it('initialize with datadog logs if params provided', () => {
      const context = { key: 'value' };
      const browserMonitoringService = new BrowserMonitoringService({
        serviceName: 'serviceName',
        serviceEnv: 'serviceEnv',
        serviceVersion: 'serviceVersion',
        authToken: 'authToken',
      });

      browserMonitoringService.info('test', context);
      expect(datadogLogs.logger.info).toHaveBeenCalledWith('test', context);
    });

    it('calls datadog init during creation', () => {
      const monitoring = new BrowserMonitoringService({
        serviceName: 'serviceName',
        serviceEnv: 'serviceEnv',
        serviceVersion: 'serviceVersion',
        authToken: 'authToken',
      });

      expect(monitoring).toBeTruthy();
      expect(datadogLogs.init).toHaveBeenCalledWith({
        clientToken: 'authToken',
        service: 'serviceName',
        version: 'serviceVersion',
        env: 'serviceEnv',
        forwardConsoleLogs: 'all',
      });
    });
  });

  it('calls logger error function when reportError called', () => {
    const context = { key: 'value' };
    const errorName = 'errorName';
    const error = new Error(errorName);
    const browserMonitoringService = new BrowserMonitoringService({
      serviceName: 'serviceName',
      serviceEnv: 'serviceEnv',
      serviceVersion: 'serviceVersion',
      authToken: 'authToken',
    });

    browserMonitoringService.reportError(error, context);

    expect(datadogLogs.logger.error).toHaveBeenCalledWith(
      errorName,
      context,
      error,
    );
  });

  it('provides base log methods and transfer them to external service', () => {
    const context = { key: 'value' };
    const message = 'message';
    const browserMonitoringService = new BrowserMonitoringService({
      serviceName: 'serviceName',
      serviceEnv: 'serviceEnv',
      serviceVersion: 'serviceVersion',
      authToken: 'authToken',
    });

    browserMonitoringService.info(message, context);
    expect(datadogLogs.logger.info).toHaveBeenCalledWith(message, context);
    browserMonitoringService.debug(message, context);
    expect(datadogLogs.logger.debug).toHaveBeenCalledWith(message, context);
    browserMonitoringService.warn(message, context);
    expect(datadogLogs.logger.warn).toHaveBeenCalledWith(message, context);
  });
});
