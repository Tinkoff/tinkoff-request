---
id: transform-url
title: Transform Plugin - Url
sidebar_label: Transform - Url
---

Transforms request url using passed function.

## Parameters

### Create options 
- `baseUrl`: string [=''] - option used in transform function
- `transform`: function [({ baseUrl, url }: Request) => `${baseUrl}${url}`] - function to transform url, accepts request options and should return string;

### Request params
- `baseUrl`: string [='''] - overwrite `baseUrl` for single request


## Example
```typescript
import request from '@tinkoff/request-core';
import transformUrl from '@tinkoff/request-plugin-transform-url';

const req = request([
    // should be set first at most cases to transform url as soon as possible
    transformUrl({
        baseUrl: '/api/',
        transform: ({baseUrl, method, session}) => {
            return `${baseUrl}${method}?session=${session}`
        }
    }),
    // ...other plugins
]);

req({method: 'test'}) // request will be send to /api/test?session=
req({method: 'test2', baseUrl: '/api2'}) // to /api2/test2?session=
req({method: 'test3', session: '123'}) // to /api/test3?session=123
```

