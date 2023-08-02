# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.11.9](https://github.com/Tinkoff/tinkoff-request/compare/@tinkoff/request-plugin-protocol-http@0.11.8...@tinkoff/request-plugin-protocol-http@0.11.9) (2023-08-02)

**Note:** Version bump only for package @tinkoff/request-plugin-protocol-http





## [0.11.8](https://github.com/Tinkoff/tinkoff-request/compare/@tinkoff/request-plugin-protocol-http@0.11.8...@tinkoff/request-plugin-protocol-http@0.11.8) (2023-07-14)


### Bug Fixes

* add special case for getting set-cookie header ([d1625cd](https://github.com/Tinkoff/tinkoff-request/commit/d1625cd8c39b761e609e2dcbdae00e8f2caef5e0))
* extend typings ([1fcc2cb](https://github.com/Tinkoff/tinkoff-request/commit/1fcc2cb32597b10d788de36303507e385042fc96))
* **protocol-http:** add body prop to error object ([#38](https://github.com/Tinkoff/tinkoff-request/issues/38)) ([0914e16](https://github.com/Tinkoff/tinkoff-request/commit/0914e1626a56b1c4b62dfee2e298f9ebc8c2ac26))
* **protocol-http:** add error object when timeout has happened ([60a3d30](https://github.com/Tinkoff/tinkoff-request/commit/60a3d3015105277da4c7869942d8ee133306e573))
* **protocol-http:** add parsed response despite response status ([3d0d4a4](https://github.com/Tinkoff/tinkoff-request/commit/3d0d4a487ca39072e855baea0a69fee87caa519f))
* **protocol-http:** do not add empty string values to query if value not set ([dbdf058](https://github.com/Tinkoff/tinkoff-request/commit/dbdf058ba3a8a283439a3d9c311f6d1f304c68d4))
* **protocol-http:** fix bug with usage of abortPromise ([#13](https://github.com/Tinkoff/tinkoff-request/issues/13)) ([f5e1e00](https://github.com/Tinkoff/tinkoff-request/commit/f5e1e0033b847f3761d0fbeebc3a37e84d418d56))
* **protocol-http:** fix check for node environment ([91ae882](https://github.com/Tinkoff/tinkoff-request/commit/91ae882236923ecf21718dd3d8e60c441a2f6fe9))
* **protocol-http:** fix promise reject error when abortPromise was used ([8e686d9](https://github.com/Tinkoff/tinkoff-request/commit/8e686d9f1ae6229213c171074b6a99e710c3be73))
* **protocol-http:** fix serialize nested objects ([36fa003](https://github.com/Tinkoff/tinkoff-request/commit/36fa00342e6096b3ab30bb1ba4fc44f9acebecdc))
* **protocol-http:** fix timeout option on node ([00eec54](https://github.com/Tinkoff/tinkoff-request/commit/00eec54ea28f48b4ed8eb65a0f3333df9343099e))
* **protocol-http:** fix usage of node-fetch in browser ([3034a22](https://github.com/Tinkoff/tinkoff-request/commit/3034a22e3bb154bf4f621d1921c009d83267644d))
* **protocol-http:** handle formData properly in browser ([d395346](https://github.com/Tinkoff/tinkoff-request/commit/d395346a5ab2ec49bbfcc9463631744a08c12ad9))
* **protocol-http:** handle TypeError: Cannot read property 'status' of undefined ([faed351](https://github.com/Tinkoff/tinkoff-request/commit/faed35179785b811f9860469ef381e5048f0e7d6))
* **protocol-http:** remove beforeunload handler ([59dfed0](https://github.com/Tinkoff/tinkoff-request/commit/59dfed06f2ff8ad5f02b4c2b25094f367de10906))
* **protocol-http:** set httpMethod to uppercase ([8d612b6](https://github.com/Tinkoff/tinkoff-request/commit/8d612b662063a91dc10e9bd3db22fd9f43534bec))


### Features

* **circuit-breaker:** add ability to specify error check for circuit breaker fail request status ([aacb719](https://github.com/Tinkoff/tinkoff-request/commit/aacb719ff17f76df51317698cf1c2e56c607b731))
* **http:** new credentials option ([e0ca825](https://github.com/Tinkoff/tinkoff-request/commit/e0ca825985d5a6d19fca320ac5daf0ac593fc745))
* **http:** new request parameter signal ([3f9830e](https://github.com/Tinkoff/tinkoff-request/commit/3f9830eabfe1a14511e3714a4cbb0f34a3a583bc))
* **protocol-http:** add possibility to specify custom querySerializer ([828a223](https://github.com/Tinkoff/tinkoff-request/commit/828a223af8eb2aaaa3e9c4780b507339728a044a))
* **protocol-http:** parse response array buffer ([46eba51](https://github.com/Tinkoff/tinkoff-request/commit/46eba5116217a3e209177a27d7be797a3048d625))
* **protocol-http:** replace superagent with fetch (or node-fetch for node) ([353dabb](https://github.com/Tinkoff/tinkoff-request/commit/353dabbffebe18060f62ff2527353137e4b63a8f))
* split context.meta into context.internalMeta and context.externalMeta ([31f00e0](https://github.com/Tinkoff/tinkoff-request/commit/31f00e0ae14767f213a67eb2df349c9f75adcfe7))
* **url-utils:** move url utils to separate package ([1ab2397](https://github.com/Tinkoff/tinkoff-request/commit/1ab239709142460ac5cdacfb93714ad5a0e7d277))
* use @tramvai/build as builder to provide modern es version ([3a26224](https://github.com/Tinkoff/tinkoff-request/commit/3a26224221d4fc073938cf32c2f147515620c28e))
