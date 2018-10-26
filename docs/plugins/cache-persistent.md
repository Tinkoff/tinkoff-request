---
id: cache-persistent
title: Cache Plugin - Persistent
sidebar_label: Cache - Persistent
---

Caches requests result into IndexedDB.
Uses library `idb-keyval` as wrapper to IndexedDB.
Works only in browsers with support of IndexedDB, otherwise does nothing.

```
options:
    shouldExecute {boolean} [= true] - is plugin enabled
    getCacheKey {function} - function used for generate cache key

requestParams:
     persistentCache {boolean} - disable this plugin at all
     persistentCacheForce {boolean} - plugin will only be executed on complete phase

metaInfo:
     persistentCache {boolean} - is current request was returned from this cache
```

