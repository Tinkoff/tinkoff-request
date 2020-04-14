---
id: retry
title: Retry Plugin
sidebar_label: Retry
---

Retries failed requests

## Parameters

### Create options 
- `retry`: number [=0] - number of attempts to execute failed request
- `retryDelay`: number | Function [=100] - time in ms to wait before execute new attempt
- `maxTimeout`: number [=60000] - final timeout for complete request including retry attempts 

### Request params
- `retry`: number - number of attempts to execute failed request
- `retryDelay`: number | Function - time in ms to wait before execute new attempt

### External meta
- `retry.attempts`: number - request start Date.now()

## Example
```typescript
import request from '@tinkoff/request-core';
import retry from '@tinkoff/request-plugin-retry';

const req = request([
    // .. cache plugin and other plugins for transform request
    retry({ retry: 3, retryDelay: 500 }),
    // ...other plugins to make actual request and validate it
]);
```
