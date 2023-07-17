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
- `querySerializer`: Function function that will be used instead of default value to serialize query strings in url

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
- `credentials`: string - configure credentials type, [see](#request-credentials)
- `abortPromise`: Promise - if passed promise resolves, request get aborted with the result of promise
- `signal`: AbortSignal - signal used to abort current request

## Request type
Defines how request payload get serialized and the value for 'Content-Type' header. By default is equal to `form`.

Might be one of:
- `json` - `payload` will be json stringified
- `form` - payload will serialized as query-string
- `form-data` - same as `form`
- `urlencoded` - same as `form`

For any different value payload will be passed as is.

## Request credentials

[`credentials`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sending_a_request_with_credentials_included
) option will be passed to fetch parameters directly. This option has priority over `withCredentials` option. 

Might be one of:
- `include`
- `same-origin`
- `omit`

If **deprecated** option `withCredentials` set to true, then `credentials` option for fetch will be set to `include` otherwise to `same-origin`.

Summary, default `credentials` fetch option is `same-origin`.

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


### Provide custom serializer for query and form-data

You can provide your own custom serializer with option `querySerializer` passed to plugin

```ts
import request from '@tinkoff/request-core';
import http from '@tinkoff/request-plugin-protocol-http';
import type { QuerySerializer } from '@tinkoff/request-plugin-protocol-http';

// this is roughly a default implementation for a serializer
const querySerializer: QuerySerializer = (obj, init = '') => {
    const searchParams = new URLSearchParams(init);

    const setParams = (params: object, keys: string[] = []) => {
        eachObj((v, k) => {
            if (isNil(v)) return;

            const arr = keys.length ? [...keys, k] : [k];

            if (isObject(v)) {
                setParams(v, arr);
            } else {
                searchParams.set(
                    reduceArr((acc, curr, i) => (i ? `${acc}[${curr}]` : curr), '', arr),
                    v
                );
            }
        }, params);
    };

    setParams(obj);

    return searchParams.toString();
};

const makeRequest = request([
    http({ querySerializer }),
]);
```

### Send files with form-data
```typescript
import request from '@tinkoff/request-core';
import http from '@tinkoff/request-plugin-protocol-http';

const makeRequest = request([
    // ... other plugins
    // should be set last as this plugin makes actual reqest
    http(),
]);

makeRequest({
  url: 'https://example.com/uploadFile',
  method: 'POST',
  payload: {},
  // put your files here, no need to add them to the FormData it will be done internally
  attaches: [fileBlob],
})
```
