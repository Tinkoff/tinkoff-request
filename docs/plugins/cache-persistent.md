---
id: cache-persistent
title: Cache Plugin - Persistent
sidebar_label: Cache - Persistent
---

!Executes only in browser, for server this plugin is noop.

Caches requests result into IndexedDB.
Uses library `idb-keyval` as wrapper to IndexedDB.

## Parameters

### Create options 
- `getCacheKey`: function [=see @tinkoff/request-cache-utils] - function used for generate cache key
- `shouldExecute`: boolean [=true] - plugin enable flag

### Request params
- `cache`: boolean [=true] - should any cache plugin be executed. 
- `cacheForce`: boolean [=false] - when enabled all cache plugin will be executed only on complete status (request wont be resolved with cache value in that case and will only store result cache on completed requests)
- `persistentCache`: boolean [=true] - should this specific cache plugin be executed
- `persistentCacheForce`: boolean [=false] - specific case of `cacheForce` for this plugin only.

### External meta
- `cache.persistentCache`: boolean - flag indicating that current request has been returned from persistent cache

## Example
```typescript
import request from '@tinkoff/request-core';
import persistentCache from '@tinkoff/request-plugin-cache-persistent';

const req = request([
    // ...plugins for any request transforms
    // should be set after transforming plugins and before other more lightweighted cache plugins
    persistentCache(),
    // should be set before protocol plugins or other heavy cache plugins
    // ...plugins for making actual request
]);
```

