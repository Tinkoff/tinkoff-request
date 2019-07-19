---
id: cache-fallback
title: Cache Plugin - Fallback
sidebar_label: Cache - Fallback
---

Hard drive cache. This cache used only if request ends with error response and returns previous success response from cache.
Works only on server-side, in browser does nothing.

```
options:
    shouldExecute {boolean} - is plugin enabled
    getCacheKey {function} - function used for generate cache key

requestParams:
    fallbackCache {boolean} - disable this plugin at all
    fallbackCacheForce {boolean} - plugin will only be executed on complete phase

metaInfo:
    fallbackCache {boolean} - is current request was returned from fallback
```

