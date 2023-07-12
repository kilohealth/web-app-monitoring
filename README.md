[![SWUbanner](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-no-action.svg)](https://stand-with-ukraine.pp.ua)

# @kilohealth/web-app-monitoring

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE.md)

## The Idea

Package was created to abstract away underlying level of monitoring,
to make it easy to setup monitoring for any env as well as to make it easy to migrate from DataDog to other monitoring solution.

The package consists of 3 parts:

- Browser / Client monitoring (browser logs)
- CLI (needed to upload sourcemaps for browser monitoring)
- Server monitoring (server logs, APM, tracing)

## Getting Started

> **Note:** If you are migrating from direct datadog integration - don’t forget to remove `@datadog/...` dependencies. Those are now dependencies of `@kilohealth/web-app-monitoring`.
>
> ```
> npm uninstall @datadog/...
> ```

### Install package

```
npm install @kilohealth/web-app-monitoring
```

### Setup environment variables

| Variable                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Upload source maps | Server (APM, tracing) | Browser / Client |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------: | :-------------------: | :--------------: |
| `MONITORING_TOOL__API_KEY`         | This key is needed in order to uploaded source maps for browser monitoring, send server side (APM) logs and tracing info. You can find API key [here](https://app.datadoghq.com/organization-settings/api-keys?id=97403b1a-0806-45e1-9ecb-fa059af82048).                                                                                                                                                                                                                                                                                                                                                                                 |         ✔️         |          ✔️           |                  |
| `MONITORING_TOOL__SERVICE_NAME`    | The service name, for example: `timely-hand-web-funnel-app`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |         ✔️         |          ✔️           |        ✔️        |
| `MONITORING_TOOL__SERVICE_VERSION` | The service version for example: `$CI_COMMIT_SHA`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |         ✔️         |          ✔️           |        ✔️        |
| `MONITORING_TOOL__SERVICE_ENV`     | The service environment for example: `$CI_ENVIRONMENT_NAME`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |         ✔️         |          ✔️           |        ✔️        |
| `MONITORING_TOOL__CLIENT_TOKEN`    | This token is needed in order to send browser monitoring logs. You can create or find client token [here](https://app.datadoghq.com/organization-settings/client-tokens).                                                                                                                                                                                                                                                                                                                                                                                                                                                                |         ️          |                       |        ✔️        |
| `MONITORING_TOOL__PUBLIC_PATH`     | This is RELATIVE path, part of URL between domain (which can be different for different environments) and path to file itself. In other words - base path for all the assets within your application.<br/>You can think of this as kind of relative [Public Path](https://webpack.js.org/guides/public-path/). For example it can be `/` or `/static`.<br/>In other words this is common relative prefix for all your static files or / if there is none.<br/> - for Vite.js the default is `/`<br/> - for Next.js the default is `/_next/static/chunks` (!!! `_` instead of `.` in file system)<br/> - for Gatsby.js the default is `/` |         ✔️         |                       |                  |
| `MONITORING_TOOL__BUILD_DIR`       | This should be RELATIVE path to your build directory. For example `./dist` or `./build`.</br>- for Vite.js default is `./dist`</br>- for Next.js default is `./.next/static/chunks`</br>- for Gatsby.js default is `./public`                                                                                                                                                                                                                                                                                                                                                                                                            |         ✔️         |                       |                  |

> **Note:** Depending on the WEB framework you are using, in order to expose environment variables to the client you may need to prefix the environment variables as mentioned below:
>
> - For Next.js, add the prefix `NEXT_PUBLIC_` to each variable. Refer to the [documentation](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables#bundling-environment-variables-for-the-browser) for more details.
> - For Gatsby.js, add the prefix `GATSBY_` to each variable. Refer to the [documentation](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/#accessing-environment-variables-in-the-browser) for more details.
> - For Vite.js, add the prefix `VITE_` to each variable. Refer to the [documentation](https://vitejs.dev/guide/env-and-mode.html) for more details.

> **Tip:** By following Single Source of Truth principle you can reexport variables, needed for the client, in the build stage (Next.js example):
>
> ```
> NEXT_PUBLIC_MONITORING_TOOL__SERVICE_NAME=$MONITORING_TOOL__SERVICE_NAME
> NEXT_PUBLIC_MONITORING_TOOL__SERVICE_VERSION=$MONITORING_TOOL__SERVICE_VERSION
> NEXT_PUBLIC_MONITORING_TOOL__SERVICE_ENV=$MONITORING_TOOL__SERVICE_ENV
> ```

### Setup browser monitoring

#### Generate hidden source maps

In order to upload source maps into the monitoring service we need to include those source map files into our build.
This can be done by slightly altering the build phase bundler configuration of our app:

<details>
<summary>Next.js (Webpack)</summary>

```js
module.exports = {
  webpack(config, context) {
    const isClient = !context.isServer;
    const isProd = !context.dev;
    const isUploadSourcemapsEnabled = Boolean(
      process.env.MONITORING_TOOL__API_KEY,
    );

    // Generate source maps only for the client side production build
    if (isClient && isProd && isUploadSourcemapsEnabled) {
      return {
        ...config,
        // No reference. No source maps exposure to the client (browser).
        // Hidden source maps generation only for error reporting purposes.
        devtool: 'hidden-source-map',
      };
    }

    return config;
  },
};
```

Refer to the [documentation](https://webpack.js.org/configuration/devtool/) for more details.

</details>

<details>
<summary>Gatsby.js (Webpack)</summary>

```js
module.exports.onCreateWebpackConfig = ({ stage, actions }) => {
  // build-javascript is prod build phase
  if (stage === 'build-javascript') {
    actions.setWebpackConfig({
      // No reference. No source maps exposure to the client (browser).
      // Hidden source maps generation only for error reporting purposes.
      devtool: 'hidden-source-map',
    });
  }
};
```

Refer to the [documentation](https://webpack.js.org/configuration/devtool/) for more details.

</details>

<details>
<summary>Vite.js</summary>

```js
export default defineConfig({
  build: {
    // No reference. No source maps exposure to the client (browser).
    // Hidden source maps generation only for error reporting purposes.
    sourcemap: 'hidden',
  },
});
```

Refer to the [documentation](https://vitejs.dev/config/build-options.html#build-sourcemap) for more details.

</details>

> **Note:** We are using `hidden source maps` only for error reporting purposes.
> That means our source maps are not exposed to the client
> and there are no references to those source maps in our source code.

#### Upload generated source maps

In order to upload generated source maps into the monitoring service, you should use `web-app-monitoring__upload-sourcemaps` bin, provided by `@kilohealth/web-app-monitoring` package.

Script example for Next.js:

```
"scripts": {
  "upload:sourcemaps": "MONITORING_TOOL__BUILD_DIR=./.next/static/chunks MONITORING_TOOL__PUBLIC_PATH=/_next/static/chunks web-app-monitoring__upload-sourcemaps",
  ...
},
```

And then your CI should run `upload:sourcemaps` script for the build that includes generated source maps.

### Browser Monitoring Usage

> **Important note:** There is no single entry point for package. You can't do smth like `import { BrowserMonitoringService } from '@kilohealth/web-app-monitoring';`
> Reason for that is to avoid bundling server-code into client bundle and vice versa. This structure will ensure effective tree shaking during build time.

> In case your bundler supports package.json `exports` field - you can also omit `dist` in path folder `import { BrowserMonitoringService } from '@kilohealth/web-app-monitoring/browser';`

```ts
import { BrowserMonitoringService } from '@kilohealth/web-app-monitoring/dist/browser';

export const monitoring = new BrowserMonitoringService({
  authToken: NEXT_PUBLIC_MONITORING_TOOL__CLIENT_TOKEN,
  serviceName: NEXT_PUBLIC_MONITORING_TOOL__SERVICE_NAME,
  serviceVersion: NEXT_PUBLIC_MONITORING_TOOL__SERVICE_VERSION,
  serviceEnv: NEXT_PUBLIC_MONITORING_TOOL__SERVICE_ENV,
});
```

As you can see we are using here all our exposed variables. If any of these is not defined - the service will fall back to console.log and warn you there about it.
Now you can just use it like

```
monitoring.info('Monitoring service initialized');
```

**OPTIONAL: If you are using React you may benefit from utilizing [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary):**

```tsx
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

### Setup Server Monitoring (Next.js)

<details>
<summary>Approach with facade</summary>

`initServerMonitoring` is a facade over `ServerMonitoringService`.
You can instantiate and use that service directly.
This function basically does one thing - instantiate it and can do 3 more additional things:

- call `overrideNativeConsole` - method of the service to override native console, to log to datadog instead.
- cal `catchProcessErrors` - method of the service to subscribe to native errors, to log them to datadog.
- put service itself into global scope under defined name, so serverside code can use it.

You may wonder why we instantiate service here and not in server-side code.
The reason for that is if we override the native console and catch native errors - we would like to set up this as soon as possible.
If you don’t care too much about the very first seconds of next server - you can use alternative simpler server side logging solution.

Example for Next.js:

- update next.config.ts to include into start script of production server code
  `next.config.ts:`

```js
const {
  initServerMonitoring,
} = require('@kilohealth/web-app-monitoring/dist/server');

module.exports = phase => {
  if (phase === PHASE_PRODUCTION_SERVER) {
    const remoteMonitoringServiceParams = {
      serviceName: process.env.MONITORING_TOOL__SERVICE_NAME,
      serviceVersion: process.env.MONITORING_TOOL__SERVICE_VERSION,
      serviceEnv: process.env.MONITORING_TOOL__SERVICE_ENV,
      authToken: process.env.MONITORING_TOOL__API_KEY,
    };
    const config = {
      shouldOverrideNativeConsole: true,
      shouldCatchProcessErrors: true,
      globalMonitoringInstanceName: 'kiloServerMonitoring',
    };
    initServerMonitoring(remoteMonitoringServiceParams, config);
  }
};
```

- update `custom.d.ts` file to declare that global scope now have monitoring service as a prop
  In order to use ServerMonitoringService instance in other parts of code via global we need to let TS know
  that we added new property to global object.
  In Next.js you can just create or add next code into `custom.d.ts` file in root of the project.
  Be aware that var name matches string that you provided in code above (kiloServerMonitoring in this case).
  `custom.d.ts:`

```ts
import { ServerMonitoringService } from '@kilohealth/web-app-monitoring/dist/server';

declare global {
  // eslint-disable-next-line no-var
  var kiloServerMonitoring: ServerMonitoringService;
}
```

- use it in code

```ts
export const getHomeServerSideProps = async context => {
  global.kiloServerMonitoring.info('getHomeServerSideProps called');
};
```

</details>

<details>
<summary>Approach with direct instantiation</summary>

If you don’t care too much about catching native errors or native logs
in the early stages of your server app -
you can avoid sharing logger via global scope and instead initialize it inside of app.

```ts
import { ServerMonitoringService } from '@kilohealth/web-app-monitoring/dist/server';

export const monitoring = new ServerMonitoringService({
  authToken: MONITORING_TOOL__API_KEY,
  serviceName: MONITORING_TOOL__SERVICE_NAME,
  serviceVersion: MONITORING_TOOL__SERVICE_VERSION,
  serviceEnv: MONITORING_TOOL__SERVICE_ENV,
});
```

As you can see we are using here all our env variables.
If any of these is not defined - the service will fall back to console.log and warn you there about it.
Now you can just use it like

```
monitoring.info('Monitoring service initialized');
```

</details>

#### Init Tracing

We need to connect tracing as soon as possible during code, so it can be injected into all base modules for APM monitoring.
Tracing module is available via:

```js
const {
  initTracing,
} = require('@kilohealth/web-app-monitoring/dist/server/initTracing');

initTracing({
  serviceName: process.env.MONITORING_TOOL__SERVICE_NAME,
  serviceVersion: process.env.MONITORING_TOOL__SERVICE_VERSION,
  serviceEnv: process.env.MONITORING_TOOL__SERVICE_ENV,
  authToken: process.env.MONITORING_TOOL__API_KEY,
});
```

Example for Next.js:

```js
const { PHASE_PRODUCTION_SERVER } = require('next/constants');
const {
  initTracing,
} = require('@kilohealth/web-app-monitoring/dist/server/initTracing');

module.exports = phase => {
  if (phase === PHASE_PRODUCTION_SERVER) {
    initTracing({
      serviceName: process.env.MONITORING_TOOL__SERVICE_NAME,
      serviceVersion: process.env.MONITORING_TOOL__SERVICE_VERSION,
      serviceEnv: process.env.MONITORING_TOOL__SERVICE_ENV,
      authToken: process.env.MONITORING_TOOL__API_KEY,
    });
  }
};
```

> **Note:** In newer versions of Next.js there is experimental feature called
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

```ts
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

```ts
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

```ts
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

```ts
catchProcessErrors();
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

```ts
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
