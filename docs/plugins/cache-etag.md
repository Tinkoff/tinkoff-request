---
id: cache-etag
title: Cache Plugin - Etag
sidebar_label: Cache - Etag
---

Caches requests response into memory.
Caching is based on etag http-header: for every request which contains 'etag' header response is stored in cache, on
subsequent calls for the same requests it adds 'If-None-Match' header and checks for 304 status of response - if status
is 304 response returns from cache.

Uses library `lru-cache` as memory storage.

```
options:
    lruOptions {object} [= {max: 1000}] - options passed to lru-cache library
    shouldExecute {boolean} [= true] is plugin activated by default
    getCacheKey {function} - function used for generate cache key
    memoryConstructor {function} [= lruCache] cache factory

requestParams:
     etagCache {boolean} - disable this plugin at all
     etagCacheForce {boolean} - plugin will only be executed on complete phase

metaInfo:
     etagCache {boolean} - is current request was returned from this cache
```
