import { initServerMonitoring } from '../initServerMonitoring';

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
const error = new Error(message);

describe(`integration: ${initServerMonitoring.name}`, () => {
  it('creates console monitoring if no flags provided', function () {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

    const monitoring = initServerMonitoring();
    monitoring.info(message);

    expect(consoleInfoSpy).toHaveBeenCalledWith(message);
    consoleInfoSpy.mockRestore();
  });

  it('creates remote monitoring if params provided', function () {
    const monitoring = initServerMonitoring(remoteMonitoringServiceParams);
    monitoring.info(message);

    expect(pinoLogger.info).toHaveBeenCalledWith(message);
  });

  it('can override console', function () {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    initServerMonitoring(remoteMonitoringServiceParams, {
      shouldOverrideNativeConsole: true,
    });

    // eslint-disable-next-line no-console
    console.info(message);
    expect(consoleInfoSpy).not.toHaveBeenCalledWith();
    expect(pinoLogger.info).toHaveBeenCalledWith(message);

    consoleInfoSpy.mockRestore();
  });

  it('can catch native errors', function () {
    const processOnSpy = jest.spyOn(process, 'on');

    initServerMonitoring(remoteMonitoringServiceParams, {
      shouldCatchProcessErrors: true,
    });
    expect(processOnSpy).toHaveBeenCalledWith(
      'unhandledRejection',
      expect.any(Function),
    );
    const errorHandler = processOnSpy.mock.calls[0][1];
    errorHandler(error);
    expect(pinoLogger.error).toHaveBeenCalledWith(
      {
        err: error,
      },
      'unhandledRejection',
    );

    processOnSpy.mockRestore();
  });

  it('can put monitoring into global scope', function () {
    const globalMonitoringInstanceName = 'globalMonitoringInstanceName';
    const monitoring = initServerMonitoring(remoteMonitoringServiceParams, {
      globalMonitoringInstanceName,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((global as any)[globalMonitoringInstanceName]).toBe(monitoring);
  });
});
