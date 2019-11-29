---
id: validate
title: Validate Plugin
sidebar_label: Validate
---

Plugin to validate response.
 
If `validator` returns falsy value plugin does nothing, otherwise return value used as a error and requests goes to the error phase. 

If `errorValidator` returns truthy for request in error phase then plugin switch phase to complete.

## Parameters

### Create options 
- `validator`: function - function to validate success request, accepts single parameter: the state of current request, should return error if request should be treated as errored request
- `errorValidator`: function - function to validate errored request, accepts single parameter: the state of current request, should return `truthy` value if request should be treated as success request
- `allowFallback`: boolean [= true] - if false adds `fallbackCache`=false option to request to prevent activating fallback cache

### External meta
- `baseUrl`: string [='''] - overwrite `baseUrl` for single request


## Example
```typescript
import request from '@tinkoff/request-core';
import validate from '@tinkoff/request-plugin-validate';

const req = request([
    // should be set first at most cases to transform url as soon as possible
    validate({
    }),
    // ...other plugins
]);

req({method: 'test'}) // request will be send to /api/test?session=
req({method: 'test2', baseUrl: '/api2'}) // to /api2/test2?session=
req({method: 'test3', session: '123'}) // to /api/test3?session=123
```

