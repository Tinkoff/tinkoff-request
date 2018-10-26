---
id: cache-memory
title: Cache Plugin - Memory
sidebar_label: Cache - Memory
---

Caches requests response into memory.
Uses library `lru-cache` as memory storage.

```
options:
    shouldExecute {boolean} [= true] - is plugin enabled
    getCacheKey {function} - function used for generate cache key
    lruOptions {object} [ = {max: 1000, maxAge: 300000}] - options passed to lru-cache library
    shouldExecute {boolean} [= true] is plugin activated by default
    allowStale {boolean} [= false] is allowed to use outdated value from cache (if true outdated value will be returned and request to update it will be run in background)
    memoryConstructor {function} [=lruCache] cache factory

requestParams:
     memoryCache {boolean} - disable this plugin at all
     memoryCacheForce {boolean} - plugin will only be executed on complete phase
     memoryCacheTtl {number} - ttl of cache of the current request

metaInfo:
     memoryCache {boolean} - is current request was returned from this cache
     memoryCacheOutdated {boolean} - is value in cache is outdated (only for plugin with allowStale = true)
```
