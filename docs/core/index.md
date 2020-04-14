---
id: index
title: @tinkoff/request-core
sidebar_label: Core
---

Modular lightweight request library extendable by plugins.

## Example of usage
```javascript
import request from '@tinkoff/request-core';
import log from '@tinkoff/request-plugin-log';
import deduplicateCache from '@tinkoff/request-plugin-cache-deduplicate';
import memoryCache from '@tinkoff/request-plugin-cache-memory';
import etagCache from '@tinkoff/request-plugin-cache-etag';
import persistentCache from '@tinkoff/request-plugin-cache-persistent';
import fallbackCache from '@tinkoff/request-plugin-cache-fallback';
import validate from '@tinkoff/request-plugin-validate';
import circuitBreaker from '@tinkoff/request-plugin-circuit-breaker'
import retry from '@tinkoff/request-plugin-retry'
import http from '@tinkoff/request-plugin-protocol-http';

const makeRequest = request([
    // The order of plugins is important
    log(), // log-plugin is first as we want it always execute
    deduplicateCache(), // plugins for cache are coming from simple one to complex as if simple cache has cached value - it will be returned and the others plugins won't be called
    memoryCache({ allowStale: true }), // passing parameters for specific plugin, see plugin docs
    persistentCache(),
    fallbackCache(), // fallbackCache is the last as it executed only for errored requests
    etagCache(),
    validate({
        validator: ({ response }) => {
            if (response.type === 'json') { return null; }
            return new Error('NOT json format');
        }
    }), // validate is placed exactly before plugin for actual request since there is no point to validate values from caches
    circuitBreaker({
        failureThreshold: 60,
        failureTimeout: 60000, 
    }), // if 60% of requests in 1 min are failed, go to special state preventing from making new requests till service is down
    retry({ retry: 3, retryDelay: 100 }), // try to retry failed request, should be placed before making actual request
    http() // on the last place the plugin to make actual request, it will be executed only if no plugin before changed the flow of request
]);

makeRequest({
    url: 'https://config.mysite.ru/resources?name=example'
})
    .then(result => console.log(result))
    .catch(error => console.error(error))
```
