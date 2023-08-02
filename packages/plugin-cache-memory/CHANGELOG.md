# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.9.4](https://github.com/Tinkoff/tinkoff-request/compare/@tinkoff/request-plugin-cache-memory@0.9.3...@tinkoff/request-plugin-cache-memory@0.9.4) (2023-08-02)

**Note:** Version bump only for package @tinkoff/request-plugin-cache-memory





## [0.9.3](https://github.com/Tinkoff/tinkoff-request/compare/@tinkoff/request-plugin-cache-memory@0.9.3...@tinkoff/request-plugin-cache-memory@0.9.3) (2023-07-14)


### Bug Fixes

* **cache-memory:** do not abort background memory requests ([80395f9](https://github.com/Tinkoff/tinkoff-request/commit/80395f9be96cb73e62d09590aa89f043ab8ca679))
* **cache-memory:** fix unhandled rejection when renew cache in background fails ([a5a50a4](https://github.com/Tinkoff/tinkoff-request/commit/a5a50a463f632614b8be4bc39d540d3503b44914))
* extend typings ([1fcc2cb](https://github.com/Tinkoff/tinkoff-request/commit/1fcc2cb32597b10d788de36303507e385042fc96))


### Features

* **cache-memory:** allow to specify time of life for outdated value in memory cache ([48bd8ad](https://github.com/Tinkoff/tinkoff-request/commit/48bd8adb52cac7aea3f5a42ab6f1999edec4c704))
* parametrize background requests timeout ([#88](https://github.com/Tinkoff/tinkoff-request/issues/88)) ([d391fae](https://github.com/Tinkoff/tinkoff-request/commit/d391fae684a0d4ff2a5990ad4114c82f1208e09e))
* split context.meta into context.internalMeta and context.externalMeta ([31f00e0](https://github.com/Tinkoff/tinkoff-request/commit/31f00e0ae14767f213a67eb2df349c9f75adcfe7))
* update lru-cache ([dc65ec9](https://github.com/Tinkoff/tinkoff-request/commit/dc65ec92fb185b0100d5a87f4aecadc39f2a9cd5))
* use @tramvai/build as builder to provide modern es version ([3a26224](https://github.com/Tinkoff/tinkoff-request/commit/3a26224221d4fc073938cf32c2f147515620c28e))
