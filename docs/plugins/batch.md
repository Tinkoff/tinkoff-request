---
id: batch
title: Batch Plugin
sidebar_label: Batch
---

Batches multiple requests into a single request. Only requests with option `batchKey` are get batched. Requests with equal `batchKey` are grouped together if they were initiated in window of `batchTimeout` ms.

## Parameters

### Create options 
- `timeout`: number [=100] - time to wait in ms. After timeout all requests with equal `batchKey` will be send in a single grouped request
- `makeGroupedRequest`: function - function accepts an array of requests and returns promise which should be resolved with an array of responses
- `shouldExecute`: boolean [=true] - plugin enable flag

### Request params
- `batchKey`: string - id to group request by
- `batchTimeout`: number[=timeout] - time to wait in ms. After timeout all requests with equal `batchKey` will be send in a single grouped request

### External meta
- `batch.batched`: boolean - flag indicating that current request has been batched

## Example
```typescript
import request from '@tinkoff/request-core';
import batch from '@tinkoff/request-plugin-batch';

const makeGroupedRequest = (requests: any[]) => {
    return batchRequest(requests)
        .then(() => {
            return requests.map(request => 'res' + request.option);
        })
}

const req = request([
    // ...plugins for caching and memory
    // should be set after caching and enhance plugins to prevent requesting batch api for cached requests or with wrong data 
    batch({ 
        timeout: 200, // wait 200ms before executin request to allow group serveral requests
        shouldExecute: typeof window !== 'undefined', // for browsers only, as grouping is not so efficient on server-side.
        makeGroupedRequest,
    }),
    // should be set just before protocol plugin, to prevent request to common non-batch api
    // ...plugins for making actual request
]);

req({url: 'test1', batchKey: 'test', option: '1'}) // => resolves with 'res1'
req({url: 'test2', batchKey: 'test', option: '2'}) // => resolves with 'res2'

setTimeout(() => {
    // will be executed in another batched request, because it didnt fit in 200ms timeout
    req({url: 'test3', batchKey: 'test', option: '3'}) // => resolves with 'res3'
}, 300)

// makeGroupedRequest will be called with argument [{url: 'test1', batchKey: 'test', option: '1'}, {url: 'test1', batchKey: 'test', option: '1'}] first time
// and with [{url: 'test3', batchKey: 'test', option: '3'}] second time
// each request will be resolved with according response by index from result of makeGroupedRequest

```
