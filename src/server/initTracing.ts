import { tracer as ddTracer, TracerOptions } from 'dd-trace';

interface Params extends Omit<TracerOptions, 'service' | 'env' | 'version'> {
  authToken: string;
  serviceName: string;
  serviceVersion: string;
  serviceEnv: string;
}

export const initTracing = (params: Params) => {
  const {
    authToken,
    serviceName,
    serviceVersion,
    serviceEnv,
    ...ddTracerParams
  } = params;

  // because dd tracer doesn't accept api key as property we wanna set it in the process
  // because we want to abstract away underlying library details we set env var here and not via CI

  process.env.DD_API_KEY = authToken;

  return ddTracer.init({
    // Your options here.
    runtimeMetrics: true,
    logInjection: true,
    service: serviceName,
    env: serviceEnv,
    version: serviceVersion,
    ...ddTracerParams,
  });
};
