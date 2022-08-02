# @tinkoff/request
Modular lightweight request library extendable by plugins.

[Documentation](https://tinkoff.github.io/tinkoff-request/)

[![Edit on CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/tinkoff-request-playground-0t1wrs?file=/src/index.ts)

## Example of usage
```javascript
import request from '@tinkoff/request-core';
import log from '@tinkoff/request-plugin-log';
import deduplicateCache from '@tinkoff/request-plugin-cache-deduplicate';
import memoryCache from '@tinkoff/request-plugin-cache-memory';
import persistentCache from '@tinkoff/request-plugin-cache-persistent';
import fallbackCache from '@tinkoff/request-plugin-cache-fallback';
import validate from '@tinkoff/request-plugin-validate';
import http from '@tinkoff/request-plugin-protocol-http';

const makeRequest = request([
    // The order of plugins is important
    log(), // log-plugin is first as we want it always execute
    memoryCache({ allowStale: true }), // passing parameters for specific plugin, see plugin docs
    persistentCache(),
    fallbackCache(), // fallbackCache is the last as it executed only for errored requests
    deduplicateCache(), // plugins for cache are coming from simple one to complex as if simple cache has cached value - it will be returned and the others plugins won't be called
    validate({
        validator: ({ response }) => {
            if (response.type === 'json') { return null; }
            return new Error('NOT json format');
        }
    }), // validate is placed exactly before plugin for actual request since there is no point to validate values from caches
    http() // on the last place the plugin to make actual request, it will be executed only if no plugin before changed the flow of request
]);

makeRequest({
    url: 'https://config.mysite.ru/resources?name=example'
})
    .then(result => console.log(result))
    .catch(error => console.error(error))
```

## Plugins
Plugins can inject to the request flow to change its execution or adjust request\response data.

### List of plugins
1. `protocol/http` - base plugin to make request with http\https
1. `protocol/jsonp` - plugin to make jsonp requests
1. `cache/deduplicate` - deduplicate identical requests
1. `cache/memory` - caches responses into memory
1. `cache/etag` - [!server only] cache based on etag http-header
1. `cache/fallback` - [!server only] stores response data to disk and returns from cache only for errored requests
1. `cache/persistent` - [!browser only] caching data at IndexedDB to keep cache among page reloads
1. `log` - logs the data of request execution
1. `batch` - groups several request into single one
1. `validate` - validate response or restore on errors
1. `transform-url` - transforms url string for every request
1. `circuit-breaker` - [!server only] fault protections
