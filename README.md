# @frontend/web-app-monitoring

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE.md)

This package is for monitoring and error tracking.
It consists of 3 parts - browser, server and cli.

## Table of Contents

1. [Getting started](#getting-started)
2. [Usage in project](#usage-in-project)
3. [Methods](#methods)

## Getting started

Add dependency

```
$ npm install @frontend/web-app-monitoring
```

## Usage in project

### Browser or Server Methods

- `debug, info, warn, error`: adds item to logs (either local or remote, depending on setup);
- `reportError`: reports error to monitoring system (either local or remote, depending on setup);

```js
import { BrowserMonitoringService } from '@frontend/web-app-monitoring';

export const localMonitoring = new BrowserMonitoringService();
localMonitoring.info('Smth happened');
```

or

```js
import { ServerMonitoringService } from '@frontend/web-app-monitoring';

const serverMonitoringService = new ServerMonitoringService({
  serviceName: 'serviceName',
  serviceEnv: 'serviceEnv',
  serviceVersion: 'serviceVersion',
  clientToken: 'clientToken',
});
serverMonitoringService.info('Smth happened');
```

### Server Only

- `initServerMonitoring`: creates serverMonitoringService under the hood and can do additional utility functions.
  Returns instance of serverMonitoringService.

```js
import { initServerMonitoring } from '@frontend/web-app-monitoring';

const remoteMonitoringServiceParams = {
  serviceName: `${process.env.MONITORING_TOOL__SERVICE_NAME}__next-server`,
  serviceVersion: process.env.MONITORING_TOOL__SERVICE_VERSION,
  serviceEnv: process.env.MONITORING_TOOL__SERVICE_ENV,
  authToken: process.env.MONITORING_TOOL__API_KEY,
};
initServerMonitoring(remoteMonitoringServiceParams, {
  shouldOverrideNativeConsole: true,
  shouldCatchProcessErrors: true,
  globalMonitoringInstanceName: 'kiloServerMonitoring',
});
```

#### Params:

- `shouldOverrideNativeConsole` - defaults to false. When true - service will override native console with itself.
- `shouldCatchProcessErrors` - defaults to false. When true - service will subscribe to native errors and report them
- `globalMonitoringInstanceName` - defaults to empty string. When provided - service will put itself into global node scope under provided name. So it can be accessed in other parts of the code.

- `initTracing`: initiate tracing of application. Need to be provided with remote monitoring system params.
  Returns instance of tracer.

```js
import { initTracing } from '@frontend/web-app-monitoring';

const remoteMonitoringServiceParams = {
  serviceName: `${process.env.MONITORING_TOOL__SERVICE_NAME}__next-server`,
  serviceVersion: process.env.MONITORING_TOOL__SERVICE_VERSION,
  serviceEnv: process.env.MONITORING_TOOL__SERVICE_ENV,
  authToken: process.env.MONITORING_TOOL__API_KEY,
};
initTracing(remoteMonitoringServiceParams);
```

### CLI usage

In order to upload sourcemaps to remote monitoring service you can use cli from this package like `web-app-monitoring__upload-sourcemaps` as shown below

```json
{
  "scripts": {
    "upload:sourcemaps": "IS_SOURCEMAP_UPLOAD_BUILD=1 npm run build && MONITORING_TOOL__BUILD_DIR=./.next/static/chunks MONITORING_TOOL__PUBLIC_PATH=/_next/static/chunks web-app-monitoring__upload-sourcemaps"
  }
}
```

- `MONITORING_TOOL__BUILD_DIR` - relative path to bulid folder, where sourcemaps are located
- `MONITORING_TOOL__PUBLIC_PATH` - relative public path to js files, when code is served in production

## Roadmap

- write guide on using instrumentation hook for nextjs server integration
- write guide on env variables renaming
- add guide on next integration (TS, global variables, phase in next.config.js)
