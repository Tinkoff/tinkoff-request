---
id: protocol-http
title: Protocol Plugin - Http
sidebar_label: Protocol - Http
---

Makes http/https request.
Uses `node-fetch` library.

```
requestParams:
     httpMethod {string} [='get']
     url {string}
     query {object}
     queryNoCache {object} - query which wont be used in generating cache key
     headers {object}
     type {string} [='form']
     payload {object}
     attaches {array}
     jsonp {boolean | object}
     timeout {number}
     withCredentials {boolean}
     abortPromise {Promise}
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

