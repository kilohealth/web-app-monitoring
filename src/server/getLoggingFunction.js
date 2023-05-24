function cleanObjectForSerialization(value) {
  // Clean up or copy `value` so our logger or error reporting system
  // can record it.
  //
  // Because our logger `pino` uses JSON.stringify, we need to do
  // the following here:
  //
  // 1. Remove all cycles. JSON.stringify throws an error when you pass
  //    a value with cyclical references.
  //    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value
  // 2. Because JSON.stringify only serializes enumerable properties, we
  //    need to copy interesting, but non-enumerable properties like
  //    value.name and value.message for errors:
  //    JSON.stringify(new Error('nothing serialized')) returns '{}'
  //
  // Implementing this correctly is beyond the scope of my example.
  return value;
}

export function getLoggingFunction(/** @type {string} */ levelName, logger) {
  const baseLogFn = (logger[levelName] || logger.info).bind(logger);

  return function patchedLog(/** @type {any[]} */ ...parts) {
    /** @type {object | undefined} */
    let data;
    /** @type {object | undefined} */
    let error;

    /** @type {object | undefined} */
    const nativeError = parts.find(
      // eslint-disable-next-line arrow-parens
      it =>
        (it && it instanceof Error) ||
        (it && typeof it === 'object' && 'name' in it && 'message' in it),
    );

    if (nativeError) {
      error = cleanObjectForSerialization(nativeError);
      // If you use Sentry, Rollbar, etc... you could capture the error here.
      // ErrorThingy.report(nativeError)
    }

    // If next is trying to log funky stuff, put it into the data object.
    if (parts.length > 1) {
      data = data || {};
      // eslint-disable-next-line arrow-parens
      data.parts = parts.map(part => cleanObjectForSerialization(part));
    }

    const messages =
      nativeError && parts.length === 1 ? [nativeError.toString()] : parts;

    baseLogFn({ data, error, type: levelName }, ...messages);
  };
}
