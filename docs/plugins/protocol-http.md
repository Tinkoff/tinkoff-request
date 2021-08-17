---
id: protocol-http
title: Protocol Plugin - Http
sidebar_label: Protocol - Http
---

Makes http/https request.
Uses `node-fetch` library.

!!! Plugin requires `fetch` polyfill for browsers without support.

## Api

### Create options
- `agent`: { http: Agent; https: Agent } - optional agent parameter used for nodejs

### Request params
- `httpMethod`: string [='get'] - http method of the request
- `url`: string - url to request
- `query`: object - get-parameters of the request
- `queryNoCache`: object - query which wont be used in generating cache key
- `headers`: object - request headers
- `type`: string [='form'] - type of the request, [see](#request-type)
- `responseType`: string - defines type of the response (used for response parsing)
- `payload`: object - request payload, sends as body
- `attaches`: array - attached files
- `timeout`: number - timeout in ms
- `withCredentials`: boolean - configure credentials type, [see](#request-credentials)
- `abortPromise`: Promise - if passed promise resolves, request get aborted with the result of promise

## Request type
Defines how request payload get serialized and the value for 'Content-Type' header. By default is equal to `form`.

Might be one of:
- `json` - `payload` will be json stringified
- `form` - payload will serialized as query-string
- `form-data` - same as `form`
- `urlencoded` - same as `form`

For any different value payload will be passed as is.

## Request credentials
If `withCredentials` set to true, then `credentials` option for fetch will be set to 'include' otherwise to 'same-origin'

## Validators

- `isNetworkFail` - checks that error happened due to network fails (timeout or request were blocked)
- `isServerError` - check that error happened due to unexpected error on server (request.status = 500)

## How to

### Base example
```typescript
import request from '@tinkoff/request-core';
import http from '@tinkoff/request-plugin-protocol-http';

const req = request([
    // ... other plugins
    // should be set last as this plugin makes actual reqest
    http(),
]);
```

### Get additional parameters for request

Plugin provides utilities to get extra-parameters from request (like headers, status, raw-text).

Example of usage:
```typescript
import request from '@tinkoff/request-core';
import http, { getHeaders, getHeader, getStatus } from '@tinkoff/request-plugin-protocol-http';

const makeRequest = request([
    http(),
]);

const req = makeRequest({
    url: 'https://config.mysite.ru/resources?name=example'
})
    .then(result => console.log(result, getStatus(req), getHeader(req, 'content-type')))
    .catch(error => console.error(error, getHeaders(req)))
```


