#!/bin/bash

# Read the argument values
while [[ "$#" -gt 0 ]]
  do
    case $1 in
      -p|--publicPath) PUBLIC_PATH="$2"; shift;;
      -d|--buildDir) BUILD_DIR="$2"; shift;;
    esac
    shift
done

# TODO: show only absent variable
if [[ -z "${MONITORING_TOOL__API_KEY}" ]] || [[ -z "${MONITORING_TOOL__SERVICE_NAME}" ]] || [[ -z "${MONITORING_TOOL__SERVICE_VERSION}" ]] || [[ -z "${BUILD_DIR}" ]] || [[ -z "${PUBLIC_PATH}" ]]; then
  echo "Some of required variables or params for sourcemaps upload are not set. Please check MONITORING_TOOL__API_KEY, MONITORING_TOOL__SERVICE_NAME, MONITORING_TOOL__SERVICE_VERSION env vars and --publicPath --buildDir args"
  echo "MONITORING_TOOL__API_KEY - $MONITORING_TOOL__API_KEY"
  echo "MONITORING_TOOL__SERVICE_NAME - $MONITORING_TOOL__SERVICE_NAME"
  echo "MONITORING_TOOL__SERVICE_VERSION - $MONITORING_TOOL__SERVICE_VERSION"
  echo "--buildDir - $BUILD_DIR"
  echo "--publicPath - $PUBLIC_PATH"
  exit 1
else
  DATADOG_API_KEY=$MONITORING_TOOL__API_KEY npx @datadog/datadog-ci@^2.11.0 sourcemaps upload "$BUILD_DIR" \
    --minified-path-prefix="$PUBLIC_PATH" \
    --service="$MONITORING_TOOL__SERVICE_NAME" \
    --release-version="$MONITORING_TOOL__SERVICE_VERSION"
fi
