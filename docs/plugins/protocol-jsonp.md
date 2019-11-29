---
id: protocol-jsonp
title: Protocol Plugin - Jsonp
sidebar_label: Protocol - Jsonp
---

!Executes only in browser, on server this plugin is noop.

Makes jsonp request.
Uses `fetch-jsonp` library.

## Parameters

### Create options 
Options are passed to [`fetch-jsonp`](https://github.com/camsong/fetch-jsonp) on every request. 

### Request params
- `url`: string - url to request
- `query`: object - query parameters of the request
- `queryNoCache`: object - same as `query` but value wont be used when generating cache key
- `jsonp`: object - configuration passed for `fetch-jsonp`, this value is merge with created options and get passed for every request

## Example
```typescript
import request from '@tinkoff/request-core';
import jsonp from '@tinkoff/request-plugin-protocol-jsonp';

const req = request([
    // ... other plugins
    // should be set last as this plugin makes actual reqest
    jsonp(),
]);
```
