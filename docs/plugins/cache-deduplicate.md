---
id: cache-deduplicate
title: Cache Plugin - Deduplicate
sidebar_label: Cache - Deduplicate
---

Deduplicate requests with equal cache keys before making a request. If plugin is executed it will check all currently running requests, all requests with equal cache key will transform into single request, and resolve or reject accordingly to that single request.

## Parameters

### Create options 
- `getCacheKey`: function [=see @tinkoff/request-cache-utils] - function used for generate cache key
- `shouldExecute`: boolean [=true] - plugin enable flag

### Request params
- `cache`: boolean [=true] - should any cache plugin be executed. 
- `deduplicateCache`: boolean [=true] - should this specific cache plugin be executed

### External meta
- `cache.deduplicated`: boolean - flag indicating that current request has been deduplicated

## Example
```typescript
import request from '@tinkoff/request-core';
import deduplicateCache from '@tinkoff/request-plugin-cache-deduplicate';

const req = request([
    // ...plugins for any request transforms
    // should be set after transforming plugins and before any other heavy plugins
    deduplicateCache(),
    // should be set before protocol plugins or other heavy cache plugins
    // ...plugins for making actual request
]);

req({url: 'test1'}) 
req({url: 'test1'}) // this request will be deduplicated in prior of first one
req({url: 'test2'}) // cacheKey for that request by default is differ, so another request will be send

```
