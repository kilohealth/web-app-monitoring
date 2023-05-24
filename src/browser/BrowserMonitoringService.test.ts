import { datadogLogs } from '@datadog/browser-logs';

import { BrowserMonitoringService } from './BrowserMonitoringService';

jest.mock('@datadog/browser-logs', () => ({
  datadogLogs: {
    logger: {
      info: jest.fn(),
    },
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
      const browserMonitoringService = new BrowserMonitoringService({
        serviceName: 'serviceName',
        serviceEnv: 'serviceEnv',
        serviceVersion: 'serviceVersion',
        authToken: '',
      });

      browserMonitoringService.info('test', context);
      expect(consoleInfoSpy).toHaveBeenCalledWith('test', context);
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
  });
});
