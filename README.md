# @frontend/web-app-monitoring

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE.md)

## The Idea

Package was created to abstract away underlying level of monitoring,
to make it easy to setup monitoring for any env as well as to make it easy to migrate from DataDog to other monitoring solution.

The package consists of 3 parts:

- browser monitoring
- CLI (needed to upload sourcemaps for browser monitoring)
- server monitoring

## Browser monitoring setup:

### Install package

```
npm install @kilohealth/web-app-monitoring
```

> If you migrating from direct datadog integration - don’t forget to remove @datadog/browser-logs and @datadog/datadog-ci. Those are now deps of @kilohealth/web-app-monitoring.

```
npm uninstall @datadog/browser-logs @datadog/datadog-ci
```

### Add build phase env variables

- `MONITORING_TOOL__API_KEY` - this key is needed in order to uploaded sourcemaps for browser monitoring. You can find API key [here](https://app.datadoghq.com/organization-settings/api-keys?id=97403b1a-0806-45e1-9ecb-fa059af82048).
- `MONITORING_TOOL__SERVICE_NAME`, `MONITORING_TOOL__SERVICE_VERSION` and `MONITORING_TOOL__SERVICE_ENV`- the service name, version and env. These variables will be used by client code as well as by cli. Most client frameworks will not expose all node build phase env vars, so you probably need to reexpose them with prefix to switch on automatic replacement for client code during client build. In particular
  - For NextJS - you have to add prefix `NEXT_PUBLIC_` to each of them. For example you have to add not only `MONITORING_TOOL__SERVICE_NAME=timely-hand-web-funnel-app` but also `NEXT_PUBLIC_MONITORING_TOOL__SERVICE_NAME=$MONITORING_TOOL__SERVICE_NAME`. See more in [docs](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#exposing-environment-variables-to-the-browser).
  - For GatsbyJS - you have to add prefix `GATSBY_`. See more in [docs](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/#accessing-environment-variables-in-the-browser)
  - For ViteJS - you have to add prefix `VITE_`. See more in [docs](https://vitejs.dev/guide/env-and-mode.html#env-files).
- `MONITORING_TOOL__CLIENT_TOKEN` - this is client side token, which need to be built into client code in order to send logs into DD server.
  Because it is needed on client you will have to re-expose it using same approach as variables above (probably prefixing env var).
  Token you can create or find [here](https://app.datadoghq.com/organization-settings/client-tokens).
  > PS: theoretically you can avoid creating `MONITORING_TOOL__CLIENT_TOKEN` env variable and create only `NEXT_PUBLIC_MONITORING_TOOL__CLIENT_TOKEN` instead, because this variable is not needed for CLI to work. But for the sake of SRP we advocate for sticking with same reexposing approach here.

#### Example of full env variables setup for client monitoring:

##### Expose client token to be able to reexpose it for client-side code:

```
MONITORING_TOOL__CLIENT_TOKEN=pub2_your_client_token
```

##### Set variables for source map upload CLI to work during the build phase:

```
MONITORING_TOOL__SERVICE_ENV=$CI_ENVIRONMENT_NAME
```

```
MONITORING_TOOL__SERVICE_NAME=greantess-funnel
```

```
MONITORING_TOOL__SERVICE_VERSION=$CI_COMMIT_SHA
```

```
MONITORING_TOOL__API_KEY=4be_your_api_key
```

##### Reexpose for your framework to client-side code(NextJS example):

```
NEXT_PUBLIC_MONITORING_TOOL__SERVICE_ENV=$MONITORING_TOOL__SERVICE_ENV
```

```
NEXT_PUBLIC_MONITORING_TOOL__SERVICE_NAME=$MONITORING_TOOL__SERVICE_NAME
```

```
NEXT_PUBLIC_MONITORING_TOOL__SERVICE_VERSION=$MONITORING_TOOL__SERVICE_VERSION
```

```
NEXT_PUBLIC_MONITORING_TOOL__CLIENT_TOKEN=$MONITORING_TOOL__CLIENT_TOKEN
```

### Modify your build code to generate sourcemaps, depending on env variable

Ideally we don't want to generate and upload sourcemaps during each build.
In order to opt-in for this behavior sometimes we need to make additional configuration changes in our build process.
We need to build sourcemaps only in case specific env variable `IS_SOURCEMAP_UPLOAD_BUILD` is provided.
We don't provide it for dev or debug builds, only for production.
These are articles on how to do this for different frameworks and examples.

- [Vite](https://vitejs.dev/config/build-options.html#build-sourcemap)

```
export default defineConfig({
  ...
  build: {
    sourcemap: Boolean(process.env.IS_SOURCEMAP_UPLOAD_BUILD),
    ...
  }
  ...
})
```

- [NextJS](https://nextjs.org/docs/pages/api-reference/next-config-js/productionBrowserSourceMaps)

```
module.exports = {
  ...
  productionBrowserSourceMaps: Boolean(process.env.IS_SOURCEMAP_UPLOAD_BUILD),
  ...
}
```

- Gatsby is a little bit more tricky. It generates sourcemaps by default. In order to prevent this you can add code to

```
module.exports.onCreateWebpackConfig = ({ stage, actions }) => {
  // build-javascript is prod build phase
  if (stage === 'build-javascript') {
    actions.setWebpackConfig({
      // hidden-source-map removes last line from final files,
      // to avoid contenthash mismatch between builds
      // we don't want sourcemaps in prod by default
      devtool: process.env.IS_SOURCEMAP_UPLOAD_BUILD
        ? 'hidden-source-map'
        : false,
    });
  }
};
```

There is also an [article](https://akashrajpurohit.com/blog/disable-source-maps-in-gatsbyjs-v2/) with more details.

### Add build and upload sourcemaps script to scripts section

#### Prepare sourcemap upload build

It should run bin from our lib called `web-app-monitoring__upload-sourcemaps`.
For this script to work you would need to provide it with two variables

- `MONITORING_TOOL__PUBLIC_PATH` - this is RELATIVE path, part of URL between domain (which can be different for different environments) and path to file itself.
  In other words - base path for all the assets within your application.
  You can think of this as kind of relative [Public Path | webpack](https://webpack.js.org/guides/public-path/).
  For example it can be `/` or `/static`.
  In other words this is common relative prefix for all your static files or / if there is none.
  - for Vite default is `/`
  - for NextJS default is `/_next/static/chunks` (!!! `_` instead of `.` in file system)
  - for GatsbyJS default is `/`
- `MONITORING_TOOL__BUILD_DIR` - this should be RELATIVE path to your build directory. For example `./dist` or `./build`.
  - for Vite default is `./dist`
  - for NextJS default is `./.next/static/chunks`
  - for GatsbyJS default is `./public`

Example for NextJS

```
MONITORING_TOOL__BUILD_DIR=./.next/static/chunks MONITORING_TOOL__PUBLIC_PATH=/_next/static/chunks web-app-monitoring__upload-sourcemaps
```

#### 1. Approach with parallel build

We advocate for this approach.
With it you have separate script to build code for deployment and another one to make a build with sourcemaps to upload those to monitoring tool.
We decided to extract source map building and uploading into separate step because:

- not each build may need these, and it will increase build time. For example, you may want to avoid this for dev builds.
- we don’t want to manually alter the build (aka removing sourcemaps from it) because it is fragile and hard to maintain
- we don’t want sourcemaps to leak into production, so we wanna separate generating them and uploading files into prod into different processes

Example for NextJS

```
"upload:sourcemaps": "IS_SOURCEMAP_UPLOAD_BUILD=1 npm run build && MONITORING_TOOL__BUILD_DIR=./.next/static/chunks MONITORING_TOOL__PUBLIC_PATH=/_next/static/chunks web-app-monitoring__upload-sourcemaps"
```

And then your CI should run `upload:sourcemaps` script in parallel with main build,
to avoid blocking and increasing main build time.

#### 2. Approach with same build

There is alternative approach to tweak main build process with sourcemaps.
We need to do next things:

- switch sourcemaps to be hidden.
  For example instead of using option sourcemaps use hidden-sourcemaps.
  With this we will avoid warning in console in production regarding the fact that files have a reference to sourcemaps but sourcemaps are not found.
  We are just removing this reference during build phase.

- extend usual build script with flag to include sourcemaps `IS_SOURCEMAP_UPLOAD_BUILD`,
  script to upload them and script to remove them. For example

```
"only-upload:sourcemaps": "MONITORING_TOOL__BUILD_DIR=./public MONITORING_TOOL__PUBLIC_PATH=/ web-app-monitoring__upload-sourcemaps",
"remove:sourcemaps": "find ./public -name \"*.map\" -type f -delete",
"build": "IS_SOURCEMAP_UPLOAD_BUILD=1 gatsby build --prefix-paths && npm run only-upload:sourcemaps && npm run remove:sourcemaps",
```

### Usage: Import and instantiate BrowserMonitoringService

```
import { BrowserMonitoringService } from '@kilohealth/web-app-monitoring/dist/browser';

export const monitoring = new BrowserMonitoringService({
  authToken: NEXT_PUBLIC_MONITORING_TOOL__CLIENT_TOKEN,
  serviceName: NEXT_PUBLIC_MONITORING_TOOL__SERVICE_NAME,
  serviceVersion: NEXT_PUBLIC_MONITORING_TOOL__SERVICE_VERSION,
  serviceEnv: NEXT_PUBLIC_MONITORING_TOOL__SERVICE_ENV,
})
```

As you can see we are using here all our exposed variables. If any of these is not defined - the service will fall back to console.log and warn you there about it.
Now you can just use it like

```
monitoring.info('Monitoring service initialized');
```

#### OPTIONAL: If you are using React you may benefit from utilizing [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary):

```
import React, { Component, PropsWithChildren } from 'react';
import { monitoring } from '../services/monitoring';

interface ErrorBoundaryProps {}
interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  state: ErrorBoundaryState = {
    hasError: false,
  };

  componentDidCatch(error: Error) {
    monitoring.reportError(error);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Sorry... There was an error</h1>;
    }

    return this.props.children;
  }
}
```

## Server monitoring setup (NextJS):

### Install package

```
npm install @kilohealth/web-app-monitoring
```

### Add build phase env variables

- `MONITORING_TOOL__API_KEY` - this key is needed in order to send logs. You can find API key [here](https://app.datadoghq.com/organization-settings/api-keys?id=97403b1a-0806-45e1-9ecb-fa059af82048).
- `MONITORING_TOOL__SERVICE_NAME`, `MONITORING_TOOL__SERVICE_VERSION` and `MONITORING_TOOL__SERVICE_ENV` - the service name, version and env. These variables will be used to send logs.

#### Example of full env variables setup for server monitoring:

##### Set variables for sending logs:

```
MONITORING_TOOL__SERVICE_ENV=$CI_ENVIRONMENT_NAME
```

```
MONITORING_TOOL__SERVICE_NAME=greantess-funnel
```

```
MONITORING_TOOL__SERVICE_VERSION=$CI_COMMIT_SHA
```

```
MONITORING_TOOL__API_KEY=4be_your_api_key
```

### Usage

#### Approach with facade

`initServerMonitoring` is a facade over `ServerMonitoringService`.
You can instantiate and use that service directly.
This function basically does one thing - instantiate it and can do 3 more additional things:

- call `overrideNativeConsole` - method of the service to override native console, to log to datadog instead.
- cal `catchProcessErrors` - method of the service to subscribe to native errors, to log them to datadog.
- put service itself into global scope under defined name, so serverside code can use it.

You may wonder why we instantiate service here and not in server-side code.
The reason for that is if we override the native console and catch native errors - we would like to set up this as soon as possible.
If you don’t care too much about the very first seconds of next server - you can use alternative simpler server side logging solution.

Example(for NextJS):

- update next.config.ts to include into start script of production server code
  `next.config.ts:`

```
const { initServerMonitoring } = require('@kilohealth/web-app-monitoring/dist/server');

module.exports = phase => {
  if (phase === PHASE_PRODUCTION_SERVER) {
    const remoteMonitoringServiceParams = {
      serviceName: process.env.MONITORING_TOOL__SERVICE_NAME,
      serviceVersion: process.env.MONITORING_TOOL__SERVICE_VERSION,
      serviceEnv: process.env.MONITORING_TOOL__SERVICE_ENV,
      authToken: process.env.MONITORING_TOOL__API_KEY,
    };
    config = {
      shouldOverrideNativeConsole: true,
      shouldCatchProcessErrors: true,
      globalMonitoringInstanceName: 'kiloServerMonitoring',
    }
    const monitoring = initServerMonitoring(remoteMonitoringServiceParams, config);
  }
}
```

- update `custom.d.ts` file to declare that global scope now have monitoring service as a prop
  In order to use ServerMonitoringService instance in other parts of code via global we need to let TS know
  that we added new property to global object.
  In NextJS you can just create or add next code into `custom.d.ts` file in root of the project.
  Be aware that var name matches string that you provided in code above (kiloServerMonitoring in this case).
  `custom.d.ts:`

```
import { ServerMonitoringService } from '@kilohealth/web-app-monitoring/dist/server';

declare global {
  // eslint-disable-next-line no-var
  var kiloServerMonitoring: ServerMonitoringService;
}
```

- use it in code

```
export const getHomeServerSideProps = async context => {
  global.kiloServerMonitoring.info('getHomeServerSideProps called');
  ...
};
```

#### Approach with direct instantiation

If you don’t care too much about catching native errors or native logs
in the early stages of your server app -
you can avoid sharing logger via global scope and instead initialize it inside of app.

```
import { ServerMonitoringService } from '@kilohealth/web-app-monitoring/dist/server';

export const monitoring = new ServerMonitoringService({
  authToken: MONITORING_TOOL__API_KEY,
  serviceName: MONITORING_TOOL__SERVICE_NAME,
  serviceVersion: MONITORING_TOOL__SERVICE_VERSION,
  serviceEnv: MONITORING_TOOL__SERVICE_ENV,
})
```

As you can see we are using here all our env variables.
If any of these is not defined - the service will fall back to console.log and warn you there about it.
Now you can just use it like

```
monitoring.info('Monitoring service initialized');
```

### Tracing setup:

We need to connect tracing as soon as possible during code, so it can be injected into all base modules for APM monitoring.
Tracing module is available via:

```
const { initTracing } = require('@kilohealth/web-app-monitoring/dist/server/initTracing');
initTracing({
  serviceName: process.env.MONITORING_TOOL__SERVICE_NAME,
  serviceVersion: process.env.MONITORING_TOOL__SERVICE_VERSION,
  serviceEnv: process.env.MONITORING_TOOL__SERVICE_ENV,
  authToken: process.env.MONITORING_TOOL__API_KEY,
});
```

Example(NextJS):

```
const { PHASE_PRODUCTION_SERVER } = require('next/constants');
const { initTracing } = require('@kilohealth/web-app-monitoring/dist/server/initTracing');

module.exports = phase => {
  if (phase === PHASE_PRODUCTION_SERVER) {
    initTracing({
      serviceName: process.env.MONITORING_TOOL__SERVICE_NAME,
      serviceVersion: process.env.MONITORING_TOOL__SERVICE_VERSION,
      serviceEnv: process.env.MONITORING_TOOL__SERVICE_ENV,
      authToken: process.env.MONITORING_TOOL__API_KEY,
    });
  }
}
```

> In newer versions of NextJS there is experimental feature called
> [instrumentationHook](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
> We can opt out from using undocumented `PHASE_PRODUCTION_SERVER` to use `instrumentationHook` for tracing init.

> There is also possibility to use `NODE_OPTIONS='-r ./prestart-script.js ' next start` instead.
> But there is an issue with `pino-datadog-transport`, which for performance reason spawns separate thread for log sending to data-dog and it this option seems to be passed to that process as well which triggers an infinite loop of require and initialization.

## API

### MonitoringService (both BrowserMonitoringService and ServerMonitoringService have these methods)

#### debug, info, warn

```
debug(message: string, context?: object)
info(message: string, context?: object)
warn(message: string, context?: object)
```

- `message` - any message to be logged
- `context` - object with all needed and related to the log entrance data

#### error

```
error(message: string, context?: object, error?: Error)
```

Same as above, but you can also optionally pass error instance as thrid parameter

#### reportError

```
reportError(error: Error, context?: object)
```

Shortcut for `service.error()`, which uses `error.message` field as message param for `error` method.

### BrowserMonitoringService

#### constructor

```
constructor(
  remoteMonitoringServiceParams?: RemoteMonitoringServiceParams,
  remoteMonitoringServiceConfig?: RemoteMonitoringServiceConfig,
)
```

```
interface RemoteMonitoringServiceParams {
  serviceName?: string;
  serviceVersion?: string;
  serviceEnv?: string;
  authToken?: string;
}
```

- `RemoteMonitoringServiceConfig` - datadog params passed to init function. More info in [docs](https://docs.datadoghq.com/logs/log_collection/javascript/#initialization-parameters)
- `serviceName` - name of the service
- `serviceVersion` - version of the service
- `serviceEnv` - environment where service is deployed
- `authToken` - client token

### ServerMonitoringService

#### constructor

```
constructor(
  remoteMonitoringServiceParams?: RemoteMonitoringServiceParams,
  remoteMonitoringServiceConfig?: RemoteMonitoringServiceConfig,
)
```

```
interface RemoteMonitoringServiceConfig {
  transportOptions?: Partial<TransportBaseOptions>;
  loggerOptions?: Partial<LoggerOptions>;
}
```

- `transportOptions` - [pino-datadog-transport options](https://github.com/theogravity/pino-datadog-transport#configuration-options)
- `loggerOptions` - [pino logger options](https://getpino.io/#/docs/api?id=options-object)

#### overrideLogger

Overrides logger passed as argument with monitoring logger.
All methods of this logger will be overridden with corresponding methods of server monitoring.

```
overrideLogger(unknownLogger: UnknownLogger)
```

```
interface UnknownLogger {
  log?(...parts: unknown[]): void;
  debug?(...parts: unknown[]): void;
  info(...parts: unknown[]): void;
  warn(...parts: unknown[]): void;
  error(...parts: unknown[]): void;
}
```

#### overrideNativeConsole

Calls overrideLogger for native console.

```
overrideNativeConsole()
```

#### catchProcessErrors

Subscribes to `unhandledRejection` and `uncaughtException` events of the process to report `error` in such cases.

```
catchProcessErrors()
```

### ServerMonitoringService

#### initServerMonitoring

Instantiate ServerMonitoringService with provided params and may also do additional work,
depending on provided variables.

```
initServerMonitoring = (
  remoteMonitoringServiceParams?: RemoteMonitoringServiceParams,
  monitoringOptions?: MonitoringOptions,
  remoteMonitoringServiceConfig?: RemoteMonitoringServiceConfig
): ServerMonitoringService
```

```
interface MonitoringOptions {
  shouldOverrideNativeConsole?: boolean;
  shouldCatchProcessErrors?: boolean;
  globalMonitoringInstanceName?: string;
}
```

- `RemoteMonitoringServiceParams` and `RemoteMonitoringServiceConfig` are same as in `constructor` api
- `shouldOverrideNativeConsole` - if `true`, will call `serverMonitoringService.overrideNativeConsole()` under the hood
- `shouldCatchProcessErrors` - if `true`, will call `serverMonitoringService.catchProcessErrors()` under the hood
- `globalMonitoringInstanceName` - if provided with non-empty string will put instantiated `serverMonitoringService` into global scope under provided name.
