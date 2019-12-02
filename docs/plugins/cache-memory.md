---
id: cache-memory
title: Cache Plugin - Memory
sidebar_label: Cache - Memory
---

Caches requests response into memory.
Uses library `lru-cache` as memory storage.

## Parameters

### Create options 
- `getCacheKey`: function [=see @tinkoff/request-cache-utils] - function used for generate cache key
- `shouldExecute`: boolean [=true] - plugin enable flag
- `memoryConstructor`: function [=require('lru-cache')] - cache factory
- `lruOptions`: object [={max: 1000, maxAge: 300000}] - options passed to `memoryConstuctor`
- `allowStale`: boolean [=false] - is allowed to use outdated value from cache (if true outdated value will be returned and request to update it will be run in background)
- `staleTtl`: number [=lruOptions.maxAge] - time in ms while outdated value is preserved in cache while executing background update

### Request params
- `cache`: boolean [=true] - should any cache plugin be executed. 
- `cacheForce`: boolean [=false] - when enabled all cache plugin will be executed only on complete status (request wont be resolved with cache value in that case and will only store result cache on completed requests)
- `memoryCache`: boolean [=true] - should this specific cache plugin be executed
- `memoryCacheForce`: boolean [=false] - specific case of `cacheForce` for this plugin only.
- `memoryCacheAllowStale`: boolean [=allowStale] - flag indicating that is it allowed to return outdated value from cache

### External meta
- `cache.memoryCache`: boolean - flag indicating that current request has been return from memory
- `cache.memoryCacheOutdated`: boolean - flag indicating that returned cache value is outdated
- `cache.memoryCacheBackground`: boolean - flag indicating that current request was made in background to update value in cache


## Example
```typescript
import request from '@tinkoff/request-core';
import memoryCache from '@tinkoff/request-plugin-cache-memory';

const req = request([
    // ...plugins for any request transforms and other cache plugins
    // should be set after transforming plugins
    memoryCache(),
    // should be set before protocol plugins
    // ...plugins for making actual request
]);

```
