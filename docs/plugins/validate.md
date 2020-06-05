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
- `validate.validated`: boolean - is completed request has passed validation
- `validate.errorValidated`: boolean - is errored request passed validation and switched to complete status
- `validate.error`: Error - saved error after `errorValidator` success check

## Example
```typescript
import request from '@tinkoff/request-core';
import validate from '@tinkoff/request-plugin-validate';

const req = request([
    // ...plugins for any request transforms and cache 
    // should be set after transforming plugins and cache plugins
    validate({
        validator: ({response}) => {
            if (response.resultCode !== 'OK') {
                return new Error('Not valid')    
            }
        },
        errorValidator: ({error}) => {
            return error.status === 404;
        }
    }),
    // should be set before protocol plugins
    // ...plugins for making actual request
]);

// if request was ended succesfully and response contains resultCode === 'OK' req will be resolved with response
// if request was ended succesfully and resultCode !== 'OK' req will be reject with Not valid error
// if success failed with status 404 then req will be resolved with response
// otherwise req will be rejected
req({url: 'test'}) 
```

