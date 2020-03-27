---
id: log
title: Log Plugin
sidebar_label: Log
---

Logs request events and timing

## Parameters

### Create options 
- `name`: string [=''] - string used as logger name, passed to logger
- `logger`: function [() => console] - logger factory
- `showQueryFields`: boolean | string[] [=false] - whether the plugin should show request query values.
- `showPayloadFields`: boolean | string[] [=false] - whether the plugin should show request payload values.

### Request params
- `silent`: boolean [=false] - if set info and error level logs will be ignored and only debug level enabled. 
- `showQueryFields`: boolean | string[] [=false] - whether the plugin should show request query values.
- `showPayloadFields`: boolean | string[] [=false] - whether the plugin should show request payload values.

### External meta
- `log.start`: number - request start Date.now()
- `log.end`: number - request end Date.now()
- `log.duration`: number - request duration (end - start)

## Example
```typescript
import request from '@tinkoff/request-core';
import log from '@tinkoff/request-plugin-log';

const req = request([
    // should be set first at most cases to enable logging for every requests, despite caching or other plugins logic
    log(),
    // ...other plugins
]);
```
