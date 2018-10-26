---
id: batch
title: Batch Plugin
sidebar_label: Batch
---

Batch multiple requests into a single request

```
options:
    timeout {number} [timeout = 100] - time after which plugin will initiate a grouped request
    makeGroupedRequest {function}  - function accepts an array of requests and returns promise which should be resolved with an array of responses
    shouldExecute {boolean} - is plugin enabled

requestParams:
     batchKey {string} - id to group request by
     batchTimeout {number} - time after batched request will be send

metaInfo:
    batched {boolean} - shows that current request was batched
```

