import pino from 'pino';

import { ServerMonitoringService } from './ServerMonitoringService';

const pinoLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
const pinoTransportMock = jest.fn();
jest.mock('pino', () => {
  const pino = jest.fn().mockImplementation(() => pinoLogger);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line jest/prefer-spy-on
  pino.transport = jest.fn().mockImplementation(() => pinoTransportMock);

  return pino;
});

describe('ServerMonitoringService', () => {
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
      const serverMonitoringService = new ServerMonitoringService();

      serverMonitoringService.info('test', context);
      expect(consoleInfoSpy).toHaveBeenCalledWith('test', context);
    });

    const serviceName = 'serviceName';
    const serviceEnv = 'serviceEnv';
    const serviceVersion = 'serviceVersion';
    const authToken = 'authToken';

    it('initializes with console if not enough params for remote logging provided', () => {
      const context = { key: 'value' };
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const serverMonitoringService = new ServerMonitoringService({
        serviceName,
        serviceEnv,
        serviceVersion,
        authToken: '',
      });

      serverMonitoringService.info('test', context);
      expect(consoleInfoSpy).toHaveBeenCalledWith('test', context);
      consoleWarnSpy.mockRestore();
    });

    it('initializes with datadog logs if params provided', () => {
      const context = { key: 'value' };
      const serverMonitoringService = new ServerMonitoringService({
        serviceName,
        serviceEnv,
        serviceVersion,
        authToken,
      });

      serverMonitoringService.info('test', context);
      expect(pinoLogger.info).toHaveBeenCalledWith('test', context);
    });

    it('creates datadog transport', () => {
      const monitoring = new ServerMonitoringService({
        serviceName,
        serviceEnv,
        serviceVersion,
        authToken,
      });

      expect(monitoring).toBeTruthy();
      expect(pino.transport).toHaveBeenCalledWith({
        target: 'pino-datadog-transport',
        options: {
          service: serviceName,
          ddtags: `env:${serviceEnv},version:${serviceVersion}`,
          ddClientConf: {
            authMethods: {
              apiKeyAuth: authToken,
            },
          },
        },
      });

      expect(pino).toHaveBeenCalledWith(
        {
          level: 'info',
          exitOnError: false,
        },
        pinoTransportMock,
      );
    });
  });
});
