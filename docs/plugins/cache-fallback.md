---
id: cache-fallback
title: Cache Plugin - Fallback
sidebar_label: Cache - Fallback
---

Fallback cache plugin. This cache used only if request ends with error response and returns previous success response from cache.
Actual place to store cache data depends on passed driver (file system by default).
 
## Parameters

### Create options 
- `getCacheKey`: function [=see @tinkoff/request-cache-utils] - function used for generate cache key
- `shouldExecute`: boolean [=true] - plugin enable flag
- `shouldFallback`: function [(context) => true] - should fallback value be returned from cache
- `driver`: CacheDriver [fsCacheDriver] - driver used to store fallback data

### Request params
- `cache`: boolean [=true] - should any cache plugin be executed. 
- `cacheForce`: boolean [=false] - when enabled all cache plugin will be executed only on complete status (request wont be resolved with cache value in that case and will only store result cache on completed requests)
- `fallbackCache`: boolean [=true] - should this specific cache plugin be executed
- `fallbackCacheForce`: boolean [=false] - specific case of `cacheForce` for this plugin only.

### External meta
- `cache.fallbackCache`: boolean - flag indicating that current request has been return from fallback cache


## Example

By default uses fileSystem cache driver:
```typescript
import request from '@tinkoff/request-core';
import fallbackCache from '@tinkoff/request-plugin-cache-fallback';

const req = request([
    // ...plugins for any request transforms and other cache plugins
    // should be set after transforming plugins and after other cache plugins, as this plugin is pretty heavy for execution
    fallbackCache(),
    // should be set before protocol plugins
    // ...plugins for making actual request
]);
```

To override driver:
```typescript
import request from '@tinkoff/request-core';
import fallbackCache from '@tinkoff/request-plugin-cache-fallback';
import { memoryCacheDriver } from '@tinkoff/request-plugin-cache-fallback/lib/drivers';

const req = request([
    // ...plugins for any request transforms and other cache plugins
    // should be set after transforming plugins and after other cache plugins, as this plugin is pretty heavy for execution
    fallbackCache({ driver: memoryCacheDriver() }),
    // should be set before protocol plugins
    // ...plugins for making actual request
]);
```
