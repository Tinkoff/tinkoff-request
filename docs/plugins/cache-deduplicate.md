---
id: cache-deduplicate
title: Cache Plugin - Deduplicate
sidebar_label: Cache - Deduplicate
---

Deduplicate requests with equal cache keys before making a request

```
options:
    shouldExecute {boolean} - is plugin enabled
    getCacheKey {function} - function used for generate cache key

requestParams:
     deduplicateCache {boolean} - disable this plugin at all
     deduplicateCacheForce {boolean} - plugin will only be executed on complete phase

metaInfo:
     deduplicated {boolean} - is current request was deduplicated (is not set for the first request of equals requests)
```

