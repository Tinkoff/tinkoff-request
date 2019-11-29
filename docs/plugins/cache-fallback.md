---
id: cache-fallback
title: Cache Plugin - Fallback
sidebar_label: Cache - Fallback
---

!Executes only on server, for browser this plugin is noop.

Hard drive cache. This cache used only if request ends with error response and returns previous success response from cache.

## Parameters

### Create options 
- `getCacheKey`: function [=see @tinkoff/request-cache-utils] - function used for generate cache key
- `shouldExecute`: boolean [=true] - plugin enable flag
- `shouldFallback`: function [(context) => true] - should fallback value be returned from cache

### Request params
- `cache`: boolean [=true] - should any cache plugin be executed. 
- `cacheForce`: boolean [=false] - when enabled all cache plugin will be executed only on complete status (request wont be resolved with cache value in that case and will only store result cache on completed requests)
- `fallbackCache`: boolean [=true] - should this specific cache plugin be executed
- `fallbackCacheForce`: boolean [=false] - specific case of `cacheForce` for this plugin only.

### External meta
- `cache.fallbackCache`: boolean - flag indicating that current request has been return from fallback cache


## Example
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

