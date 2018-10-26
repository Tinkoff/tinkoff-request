---
id: protocol-http
title: Protocol Plugin - Http
sidebar_label: Protocol - Http
---

Makes http/https request.
Uses `superagent` library.

```
requestParams:
     httpMethod {string} [='get']
     url {string}
     query {object}
     queryNoCache {object} - query which wont be used in generating cache key
     rawQueryString {string}
     headers {object}
     type {string} [='form']
     payload {object}
     attaches {array}
     jsonp {boolean | object}
     timeout {number}
     withCredentials {boolean}
     onProgress {function}
     abortPromise {Promise}
```

