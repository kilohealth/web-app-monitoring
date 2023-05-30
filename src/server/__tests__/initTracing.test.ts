import { tracer as ddTracer } from 'dd-trace';

import { initTracing } from '../initTracing';

jest.mock('dd-trace', () => ({
  tracer: {
    init: jest.fn(),
  },
}));

const authToken = 'authToken';
const serviceName = 'serviceName';
const serviceVersion = 'serviceVersion';
const serviceEnv = 'serviceEnv';

describe(`${initTracing.name}`, () => {
  it('inits dd tracer with merged options', () => {
    initTracing({
      authToken,
      serviceName,
      serviceVersion,
      serviceEnv,
      // additional prop
      hostname: 'hostname',
    });
    expect(ddTracer.init).toHaveBeenCalledWith({
      service: serviceName,
      env: serviceEnv,
      version: serviceVersion,
      // additional prop
      hostname: 'hostname',
      // default props
      runtimeMetrics: true,
      logInjection: true,
    });
  });

  it('sets env var for dd token', function () {
    initTracing({
      authToken,
      serviceName,
      serviceVersion,
      serviceEnv,
      // additional prop
      hostname: 'hostname',
    });
    expect(process.env.DD_API_KEY).toBe(authToken);
  });
});
