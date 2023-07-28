import { Logger as DatadogLogger } from '@datadog/browser-logs';

import { Logger, LogLevel } from '../shared/Logger';
import { userSymbol } from '../shared/userSymbol';

export class DatadogLoggerWrapper implements Logger {
  private datadogLogger: DatadogLogger;

  constructor(datadogLogger: DatadogLogger) {
    this.datadogLogger = datadogLogger;
  }

  log(
    level: LogLevel,
    ...args: [message: string, context?: object, error?: Error]
  ) {
    const [message, context, ...otherArgs] = args;

    // remove userinfo from context for datadog logger, because datadog handles user under the hood
    // other possibility would be to use datadog `usr` key in the context, but it will conflic with
    // under-the-hood implementation
    if (context && userSymbol in context) {
      // eslint-disable-next-line no-unused-vars
      const { [userSymbol]: _, ...contextWithoutUser } = context;
      this.datadogLogger[level](message, contextWithoutUser, ...otherArgs);
    }

    this.datadogLogger[level](...args);
  }

  debug(...args: [message: string, context?: object]) {
    this.log('debug', ...args);
  }

  info(...args: [message: string, context?: object]) {
    this.log('info', ...args);
  }

  warn(...args: [message: string, context?: object]) {
    this.log('warn', ...args);
  }

  error(...args: [message: string, context?: object, error?: Error]) {
    this.log('error', ...args);
  }
}
