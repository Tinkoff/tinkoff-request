---
id: circuit-breaker
title: Circuit Breaker Plugin
sidebar_label: Circuit Breaker
---

Plugin implementing `Circuit Breaker` design pattern.
 
Request maker will have 3 states:
- `Closed` - all requests are passing to the next plugin allowing to create requests
- `Open` - no requests are passing to next step, every request throws error from last 'real' request
- `Half-Open` - only limited number of requests are allowed to actually executes, if these requests were successful
state changes to Closed, otherwise goes back to Open

## Parameters

### Create options 
- `getKey`: function [= () => ''] - allows to divide requests to different instances of Circuit Breaker, by default only one Circuit Breaker instance is created
- `failureTimeout`: number [=120000] - time interval in which failed requests will considered to get state
- `failureThreshold`: number [=50] - percentage of failed requests inside `failureTimeout` interval, if that number is exceeded state changes to Open
- `minimumFailureCount`: number [=5] - number of minimum request which should be failed to consider stats from current time interval
- `openTimeout`: number [=60000] - time interval in which all requests will forcedly fail, after that timeout `halfOpenThreshold` number of requests will be executed as usual
- `halfOpenThreshold`: number [=5] - percentage of requests allowed to execute while state is Half-Open

### External meta
- `CIRCUIT_BREAKER.open`: boolean - flag indicating that current request was blocked by Circuit Breaker

### Internal meta
- `CIRCUIT_BREAKER.breaker` - Circuit Breaker instance

## Example
```typescript
import request from '@tinkoff/request-core';
import circuitBreaker from '@tinkoff/request-plugin-circuit-breaker';

const req = request([
    // ...plugins for any request transforms and cache 
    // should be set after transforming plugins and cache plugins
    circuitBreaker(),
    // should be set before protocol plugins
    // ...plugins for making actual request
]);
```
