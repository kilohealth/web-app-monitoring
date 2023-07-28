import { datadogLogs } from '@datadog/browser-logs';

import { userSymbol } from '../shared/userSymbol';

import { BrowserMonitoringService } from './BrowserMonitoringService';

//  TODO: find a way to easily reset and extend this mock in beforeEach blocks to mock only needed part
jest.mock('@datadog/browser-logs', () => ({
  datadogLogs: {
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
    init: jest.fn(),
    setUser: jest.fn(),
    getUser: jest.fn(),
    clearUser: jest.fn(),
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
      const monitoring = new BrowserMonitoringService(
        {
          serviceName: 'serviceName',
          serviceEnv: 'serviceEnv',
          serviceVersion: 'serviceVersion',
          authToken: 'authToken',
        },
        {
          silentMultipleInit: true,
        },
      );

      expect(monitoring).toBeTruthy();
      expect(datadogLogs.init).toHaveBeenCalledWith({
        clientToken: 'authToken',
        service: 'serviceName',
        version: 'serviceVersion',
        env: 'serviceEnv',
        forwardConsoleLogs: 'all',
        silentMultipleInit: true,
      });
    });
  });

  it('calls logger error function when reportError called', () => {
    const context = { key: 'value' };
    const errorMessage = 'errorMessage';
    const error = new Error(errorMessage);
    const browserMonitoringService = new BrowserMonitoringService({
      serviceName: 'serviceName',
      serviceEnv: 'serviceEnv',
      serviceVersion: 'serviceVersion',
      authToken: 'authToken',
    });

    browserMonitoringService.reportError(error, context);

    expect(datadogLogs.logger.error).toHaveBeenCalledWith(
      errorMessage,
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

  describe('user context', () => {
    const message = 'message';
    const context = { key: 'value' };
    const user = {
      email: 'john@google.com',
    };

    describe('with local logger', () => {
      let consoleInfoSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
      });

      afterEach(() => {
        consoleInfoSpy.mockRestore();
      });

      it('logs user context if present', function () {
        const browserMonitoringService = new BrowserMonitoringService();
        browserMonitoringService.userContext.setUser(user);
        browserMonitoringService.info(message);

        expect(consoleInfoSpy).toHaveBeenCalledWith(message, {
          [userSymbol]: user,
        });
      });

      it('logs updated user context', function () {
        const newUser = {
          email: 'james@google.com',
        };
        const browserMonitoringService = new BrowserMonitoringService();
        browserMonitoringService.userContext.setUser(user);
        browserMonitoringService.info(message);

        expect(consoleInfoSpy).toHaveBeenCalledWith(message, {
          [userSymbol]: user,
        });

        browserMonitoringService.userContext.setUser(newUser);
        browserMonitoringService.info(message);

        expect(consoleInfoSpy).toHaveBeenCalledWith(message, {
          [userSymbol]: newUser,
        });
      });

      it('allow context property manipulations', function () {
        const browserMonitoringService = new BrowserMonitoringService();
        const propName = 'name';
        const propValue = 'John';
        const userWithExtraProp = {
          ...user,
          [propName]: propValue,
        };
        browserMonitoringService.userContext.setUser(userWithExtraProp);
        browserMonitoringService.userContext.removeUserProperty(propName);

        browserMonitoringService.info(message);

        expect(consoleInfoSpy).toHaveBeenCalledWith(message, {
          [userSymbol]: user,
        });

        browserMonitoringService.userContext.setUserProperty(
          propName,
          propValue,
        );
        browserMonitoringService.info(message);

        expect(consoleInfoSpy).toHaveBeenCalledWith(message, {
          [userSymbol]: userWithExtraProp,
        });
      });

      it("don't log user context if it is cleared", () => {
        const browserMonitoringService = new BrowserMonitoringService();

        browserMonitoringService.userContext.setUser(user);

        browserMonitoringService.info(message);
        expect(consoleInfoSpy).toHaveBeenCalledWith(message, {
          [userSymbol]: user,
        });

        browserMonitoringService.userContext.clearUser();

        browserMonitoringService.info(message);
        expect(consoleInfoSpy).toHaveBeenCalledWith(message);
      });
    });

    describe('with remote logger', () => {
      it('uses remote logger context', function () {
        const browserMonitoringService = new BrowserMonitoringService({
          serviceName: 'serviceName',
          serviceEnv: 'serviceEnv',
          serviceVersion: 'serviceVersion',
          authToken: 'authToken',
        });

        browserMonitoringService.userContext.setUser(user);
        expect(datadogLogs.setUser).toHaveBeenCalledWith(user);
        browserMonitoringService.userContext.clearUser();
        expect(datadogLogs.clearUser).toHaveBeenCalled();
      });

      it("doesn't put user into context", function () {
        (datadogLogs.getUser as jest.Mock).mockReturnValueOnce(user);
        const browserMonitoringService = new BrowserMonitoringService({
          serviceName: 'serviceName',
          serviceEnv: 'serviceEnv',
          serviceVersion: 'serviceVersion',
          authToken: 'authToken',
        });

        browserMonitoringService.info(message, context);
        expect(datadogLogs.logger.info).toHaveBeenCalledWith(message, context);
      });
    });
  });
});
