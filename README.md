# @tinkoff/request
Modular lightweight request library extendable by plugins.

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
    deduplicateCache(), // plugins for cache are coming from simple one to complex as if simple cache has cached value - it will be returned and the others plugins won't be called
    memoryCache({ allowStale: true }), // passing parameters for specific plugin, see plugin docs
    persistentCache(),
    fallbackCache(), // fallbackCache is the last as it executed only for errored requests
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
1. `protocol/http` - base plugin to make request, based on [superagent](https://www.npmjs.com/package/superagent)
1. `cache/deduplicate` - deduplicate identical requests
1. `cache/memory` - caches responses into memory
1. `cache/fallback` - [!server only] stores response data to disk and returns from cache only for errored requests
1. `cache/persistent` - [!browser only] caching data at IndexedDB to keep cache among page reloads
1. `log` - logs the data of request execution
1. `batch` - groups several request into single one
1. `validate` - validate response
1. `circuit-breaker` - [!server only] fault protections

## Plugin flow execution
1. init - init phase, plugins are executed first to last, until some plugin changes flow to `complete` or `error` phase.
1. complete - means successful execution, plugins are executed from the plugin which changed phase to `complete` to first plugin.
1. error - means response ended with error, plugins are executed from the plugin which changed phase to `error` to first plugin.

!!!The order of plugins is important.

At any phase plugins can change the inner state of request or switch current phase (in that case plugins placed after such plugin won't be executed)
(Example: in request constructor were passed 5 plugins and in `init` phase the 3-rd plugin changed phase to `complete` - it means init-action will be executed for plugins 1, 2, 3, and complete-action for 1, 2).
Request execution is finished only when current request phase is `complete` or `error` and none of plugins switched the phase.

## Write your own plugin
Plugin is just a plain object with specific keys.

Plugin interface (all entries are optional):
1. `shouldExecute(context)` - boolean function indicating is plugin should execute at current phase
1. `init(context, next, makeRequest?)` - this function will be called at `init` phase
1. `complete(context, next, makeRequest?)` - this function will be called at `complete` phase
1. `error(context, next, makeRequest?)` - this function will be called at `error` phase

`context` - the current request execution context, an object with specific methods to change request state (request data, response, error, meta data)
`next` - callback function which should be called after plugin did its job.
`makeRequest` - function to make request (it will be executed with current settings)
