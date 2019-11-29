---
id: transform-url
title: Transform Plugin - Url
sidebar_label: Transform - Url
---

Transforms request url using passed function.

## Parameters

### Create options 
- `baseUrl`: string [=''] - option used in transform function
- `transform`: function [({ baseUrl, url }) => `${baseUrl}${url}`] - function to transform url, accepts request options and should return string;

### Internal meta
- `validate.validated`: boolean - is completed request has passed validation
- `validate.errorValidated`: boolean - is errored request passed validation and switched to complete status
- `validate.error`: Error - saved error after `errorValidator` success check


## Example
```typescript
import request from '@tinkoff/request-core';
import transformUrl from '@tinkoff/request-plugin-transform-url';

const req = request([
    // should be set first at most cases to transform url as soon as possible
    transformUrl({
        validator: ({response}) => {
            if (response.resultCode !== 'OK') {
                return new Error('Not valid')    
            }
        },
        errorValidator: ({error}) => {
            return error.status === 404;
        }
    }),
    // ...other plugins
]);

// if request was ended succesfully and response contains resultCode === 'OK' req will be resolved with response
// if request was ended succesfully and resultCode !== 'OK' req will be reject with Not valid error
// if success failed with status 404 then req will be resolved with response
// otherwise req will be rejected
req({url: 'test'}) 
```

