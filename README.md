# @frontend/web-app-monitoring

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE.md)

This package is for monitoring and error tracking. It can be initialized with DataDog now and usual console, depending on provided options.

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

```js
import { BrowserMonitoringService } from '@frontend/web-app-monitoring';

export const localMonitoring = new BrowserMonitoringService();
localMonitoring.info('Smth happened');
```

or

```js
import { BrowserMonitoringService } from '@frontend/web-app-monitoring';

const browserMonitoringService = new BrowserMonitoringService({
  serviceName: 'serviceName',
  serviceEnv: 'serviceEnv',
  serviceVersion: 'serviceVersion',
  clientToken: 'clientToken',
});
browserMonitoringService.info('Smth happened');
```

## Methods

- `info`: adds item to logs (either local or remote, depending on setup);
- `reportError`: reports error to monitoring system (either local or remote, depending on setup);
- `setupReportingNativeLogs`: intersects native logs and report them into remote system (in case needed params for remote system provided);
