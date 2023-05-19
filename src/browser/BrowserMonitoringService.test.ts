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
      consoleInfoSpy = jest.spyOn(console, 'info');
    });

    it('should initialize with console if no params provided', () => {
      const browserMonitoringService = new BrowserMonitoringService();

      browserMonitoringService.info('test');
      expect(consoleInfoSpy).toHaveBeenCalledWith('test');
    });

    it('should initialize with console if not enough params for remote logging provided', () => {
      const browserMonitoringService = new BrowserMonitoringService({
        serviceName: 'serviceName',
        serviceEnv: 'serviceEnv',
        serviceVersion: 'serviceVersion',
        clientToken: '',
      });

      browserMonitoringService.info('test');
      expect(consoleInfoSpy).toHaveBeenCalledWith('test');
    });

    it('should initialize with datadog logs if params provided', () => {
      const browserMonitoringService = new BrowserMonitoringService({
        serviceName: 'serviceName',
        serviceEnv: 'serviceEnv',
        serviceVersion: 'serviceVersion',
        clientToken: 'clientToken',
      });

      browserMonitoringService.info('test');
      expect(datadogLogs.logger.info).toHaveBeenCalledWith('test', undefined);
    });

    beforeEach(() => {
      consoleInfoSpy.mockRestore();
    });
  });
});
