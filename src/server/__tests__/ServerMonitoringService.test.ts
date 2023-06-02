import pino from 'pino';

import { ServerMonitoringService } from '../ServerMonitoringService';

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

const serviceName = 'serviceName';
const serviceEnv = 'serviceEnv';
const serviceVersion = 'serviceVersion';
const authToken = 'authToken';
const remoteMonitoringServiceParams = {
  serviceName,
  serviceEnv,
  serviceVersion,
  authToken,
};
const message = 'message';
const context = { contextKey: 'contextValue' };
const error = new Error(message);

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
      const serverMonitoringService = new ServerMonitoringService();

      serverMonitoringService.info('test');
      expect(consoleInfoSpy).toHaveBeenCalledWith('test');
    });

    it('initializes with console if not enough params for remote logging provided', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const serverMonitoringService = new ServerMonitoringService({
        ...remoteMonitoringServiceParams,
        authToken: '',
      });

      serverMonitoringService.info('test');
      expect(consoleInfoSpy).toHaveBeenCalledWith('test');
      consoleWarnSpy.mockRestore();
    });

    it('initializes with datadog logs if params provided', () => {
      const serverMonitoringService = new ServerMonitoringService(
        remoteMonitoringServiceParams,
      );

      serverMonitoringService.info('test');
      expect(pinoLogger.info).toHaveBeenCalledWith('test');
    });

    it('creates datadog transport', () => {
      const monitoring = new ServerMonitoringService(
        remoteMonitoringServiceParams,
        {
          transportOptions: {
            options: {
              debug: true,
            },
          },
          loggerOptions: {
            safe: true,
          },
        },
      );

      expect(monitoring).toBeTruthy();
      expect(pino.transport).toHaveBeenCalledWith({
        target: 'pino-datadog-transport',
        options: {
          service: serviceName,
          ddtags: `env:${serviceEnv},version:${serviceVersion}`,
          debug: true,
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
          safe: true,
        },
        pinoTransportMock,
      );
    });
  });

  it('calls logger error function when reportError called', () => {
    const serverMonitoringService = new ServerMonitoringService(
      remoteMonitoringServiceParams,
    );

    serverMonitoringService.reportError(error, context);

    expect(pinoLogger.error).toHaveBeenCalledWith(
      { ...context, err: error },
      message,
    );
  });

  it('provides base log methods and transfer them to external service', () => {
    const serverMonitoringService = new ServerMonitoringService(
      remoteMonitoringServiceParams,
    );

    serverMonitoringService.info(message);
    expect(pinoLogger.info).toHaveBeenCalledWith(message);
    serverMonitoringService.debug(message);
    expect(pinoLogger.debug).toHaveBeenCalledWith(message);
    serverMonitoringService.warn(message);
    expect(pinoLogger.warn).toHaveBeenCalledWith(message);
  });

  it('can override external logger', function () {
    const stringPropValue = 'stringPropValue';
    const objectPropValue = { key: 'objectPropValue' };
    const arrayPropValue = ['arrayPropValue'];

    const debugMock = jest.fn();
    const externalLogger = {
      debug: debugMock,
      info: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      someMaybeLogFunction: jest.fn(),
      stringProp: stringPropValue,
      objectProp: objectPropValue,
      arrayProp: arrayPropValue,
    };

    const serverMonitoringService = new ServerMonitoringService(
      remoteMonitoringServiceParams,
    );

    serverMonitoringService.overrideLogger(externalLogger);
    expect(externalLogger.stringProp).toBe(stringPropValue);
    expect(externalLogger.objectProp).toBe(objectPropValue);
    expect(externalLogger.arrayProp).toBe(arrayPropValue);

    externalLogger.debug('debugMessage', context);
    expect(debugMock).not.toHaveBeenCalled();
    // TODO: find good format for this
    expect(pinoLogger.debug).toHaveBeenCalledWith('debugMessage', {
      data: { parts: ['debugMessage', context] },
      error: undefined,
      type: 'debug',
    });
  });

  it('can override native console', function () {
    const debugConsoleSpy = jest.spyOn(console, 'debug');

    const serverMonitoringService = new ServerMonitoringService(
      remoteMonitoringServiceParams,
    );

    serverMonitoringService.overrideNativeConsole();

    // eslint-disable-next-line no-console
    console.debug('debugMessage', context);
    expect(debugConsoleSpy).not.toHaveBeenCalled();
    expect(pinoLogger.debug).toHaveBeenCalledWith('debugMessage', {
      data: { parts: ['debugMessage', context] },
      error: undefined,
      type: 'debug',
    });

    debugConsoleSpy.mockRestore();
  });

  it('can subscribe on process errors', function () {
    const processOnSpy = jest.spyOn(process, 'on');

    const serverMonitoringService = new ServerMonitoringService(
      remoteMonitoringServiceParams,
    );

    serverMonitoringService.catchProcessErrors();

    function testProcessError(errorType: string, callNumber: number) {
      expect(processOnSpy).toHaveBeenCalledWith(
        errorType,
        expect.any(Function),
      );
      const errorHandler = processOnSpy.mock.calls[callNumber][1];
      errorHandler(error);
      expect(pinoLogger.error).toHaveBeenCalledWith({ err: error }, errorType);
    }

    testProcessError('unhandledRejection', 0);
    testProcessError('uncaughtException', 1);

    processOnSpy.mockRestore();
  });

  it('prevent console from overriding by console logger', function () {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    const serverMonitoringService = new ServerMonitoringService();
    serverMonitoringService.overrideNativeConsole();
    expect(consoleWarnSpy).toHaveBeenCalled();

    jest.spyOn(serverMonitoringService, 'info').mockImplementation();
    // eslint-disable-next-line no-console
    console.info(message);
    expect(serverMonitoringService.info).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
    (serverMonitoringService.info as jest.Mock).mockRestore();
  });

  it('prevent process errors from overriding by console logger', function () {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const processOnSpy = jest.spyOn(process, 'on');

    const serverMonitoringService = new ServerMonitoringService();
    serverMonitoringService.catchProcessErrors();
    expect(processOnSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();

    processOnSpy.mockRestore();
  });

  it('swaps context and messages places for pino logger', function () {
    const serverMonitoringService = new ServerMonitoringService(
      remoteMonitoringServiceParams,
    );

    serverMonitoringService.info(message, context);

    expect(pinoLogger.info).toHaveBeenCalledWith(context, message);
  });
});
