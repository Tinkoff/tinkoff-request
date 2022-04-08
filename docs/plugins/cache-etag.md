---
id: cache-etag
title: Cache Plugin - Etag
sidebar_label: Cache - Etag
---

!Executes only on server, for browser this plugin is noop.

Caches requests response into memory.
Caching is based on etag http-header: for every request which contains 'etag' header response is stored in cache, on
subsequent calls for the same requests it adds 'If-None-Match' header and checks for 304 status of response - if status
is 304 response returns from cache.

Uses library `@tinkoff/lru-cache-nano` as memory storage.

## Parameters

### Create options
- `getCacheKey`: function [=see @tinkoff/request-cache-utils] - function used for generate cache key
- `shouldExecute`: boolean [=true] - plugin enable flag
- `memoryConstructor`: function [=require('@tinkoff/lru-cache-nano')] - cache factory
- `lruOptions`: object [={max: 1000}] - options passed to `memoryConstuctor`

### Request params
- `cache`: boolean [=true] - should any cache plugin be executed.
- `cacheForce`: boolean [=false] - when enabled all cache plugin will be executed only on complete status (request wont be resolved with cache value in that case and will only store result cache on completed requests)
- `etagCache`: boolean [=true] - should this specific cache plugin be executed
- `etagCacheForce`: boolean [=false] - specific case of `cacheForce` for this plugin only.

### External meta
- `cache.etagCache`: boolean - flag indicating that current request has been cached with etag

### Internal meta
- `CACHE_ETAG.value`: string - value for etag header of previous request

## Example
```typescript
import request from '@tinkoff/request-core';
import etagCache from '@tinkoff/request-plugin-cache-etag';

const req = request([
    // ...plugins for any request transforms and other cache plugins
    // should be set after transforming plugins and after other cache plugins, as this plugin sends real request to api
    etagCache(),
    // should be set before protocol plugins
    // ...plugins for making actual request
]);

```
