# [1.0.0-alpha.15](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.14...v1.0.0-alpha.15) (2023-06-21)


### Features

* remove single entry point to avoid overbundling ([99c2b9e](https://github.com/kilohealth/web-app-monitoring/commit/99c2b9e8bc86296573ca8310ea946f6e2fddc0c4))


### BREAKING CHANGES

* root import won't work, only import of specific modules

# [1.0.0-alpha.14](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.13...v1.0.0-alpha.14) (2023-06-16)


### Features

* replace client with browser export ([9386842](https://github.com/kilohealth/web-app-monitoring/commit/93868425c442a47fddbcffc12f36bb48a014cbfa))


### BREAKING CHANGES

* client import won't work, replace with browser

# [1.0.0-alpha.13](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.12...v1.0.0-alpha.13) (2023-06-16)


### Features

* add single entry point for all but tracing, ([17f9014](https://github.com/kilohealth/web-app-monitoring/commit/17f9014f7fdd332a3d6f2a02a0f51f8958d044f4))


### BREAKING CHANGES

* add exports, so dist folder won't work anymore when importing

# [1.0.0-alpha.12](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.11...v1.0.0-alpha.12) (2023-06-02)


### Bug Fixes

* **client,serve:** pass additional config to loger via constructor ([2394a1d](https://github.com/kilohealth/web-app-monitoring/commit/2394a1dd9b048929d66b734d6bea640f650833a0))

# [1.0.0-alpha.11](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.10...v1.0.0-alpha.11) (2023-05-31)


### Features

* **server,client:** make all RemoteMonitoringServiceParams optional ([6242317](https://github.com/kilohealth/web-app-monitoring/commit/62423178b9df8f99b8705187d1004db116033201))

# [1.0.0-alpha.10](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.9...v1.0.0-alpha.10) (2023-05-30)


### Features

* **server:** add PinoWrapper to pass context when logging ([1044f94](https://github.com/kilohealth/web-app-monitoring/commit/1044f9477dd313f4cdb81011cac5f9a3ce7f33e5))

# [1.0.0-alpha.9](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.8...v1.0.0-alpha.9) (2023-05-30)


### Features

* **browser,server:** add possibility to provide internal config, add tests ([c528365](https://github.com/kilohealth/web-app-monitoring/commit/c528365ec5ced8df515c06314544fb777b50f986))

# [1.0.0-alpha.8](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.7...v1.0.0-alpha.8) (2023-05-30)


### Bug Fixes

* **server:** remove initTracing from server import to avoid node modules import from tracing ([5b8839e](https://github.com/kilohealth/web-app-monitoring/commit/5b8839e5e5b04d59df457813d582480b0858588a))


### BREAKING CHANGES

* **server:** remove initTracing from server import

# [1.0.0-alpha.7](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.6...v1.0.0-alpha.7) (2023-05-29)


### Bug Fixes

* **iso:** update console logger to avoid logging extra undefined ([89db1e7](https://github.com/kilohealth/web-app-monitoring/commit/89db1e7ebe44c83b1e8de0c3259313fb5bddb4c4))


### BREAKING CHANGES

* **iso:** removed root index file

# [1.0.0-alpha.6](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.5...v1.0.0-alpha.6) (2023-05-29)


### Features

* **cli:** expose initTracing ([8ff21dd](https://github.com/kilohealth/web-app-monitoring/commit/8ff21ddd93d634aa2f9ff8af790f58069474fa3e))

# [1.0.0-alpha.5](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2023-05-29)


### Features

* **cli:** add initServerMonitoring and initTracing ([4be4a8b](https://github.com/kilohealth/web-app-monitoring/commit/4be4a8b9974c9ea2445c2cb75ee0c49bfc2ee64c))

# [1.0.0-alpha.4](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2023-05-24)


### Features

* **cli:** add cli script to upload sourcemaps (not tested) ([ab29a30](https://github.com/kilohealth/web-app-monitoring/commit/ab29a300d547afa5410e1412c7129986b94d0106))

# [1.0.0-alpha.3](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2023-05-24)


### Features

* add server monitoring system, extract common interface ([045e61d](https://github.com/kilohealth/web-app-monitoring/commit/045e61dbfecdee58729f488a9712e4f06e42549f))

# [1.0.0-alpha.2](https://github.com/kilohealth/web-app-monitoring/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2023-05-23)


### Bug Fixes

* **browser:** fix TS ([acc8e9a](https://github.com/kilohealth/web-app-monitoring/commit/acc8e9aa3a96c3af4b9e1d7aeb45f9de0740b0a4))


### Features

* **browser:** move DD init to constructor,update DD config, add debug, warn and error methods ([cc4c13e](https://github.com/kilohealth/web-app-monitoring/commit/cc4c13ecbd2d769686e642ced91a1586906258b8))

# 1.0.0-alpha.1 (2023-05-23)


### Features

* browser monitoring service and basic setup ([6a4a351](https://github.com/kilohealth/web-app-monitoring/commit/6a4a351e8c04dccb5504eae3fc64000ca6a716b6))

# 1.0.0 (2023-05-23)


### Features

* browser monitoring service and basic setup ([6a4a351](https://github.com/kilohealth/web-app-monitoring/commit/6a4a351e8c04dccb5504eae3fc64000ca6a716b6))
