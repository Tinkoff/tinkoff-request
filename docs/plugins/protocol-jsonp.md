---
id: protocol-jsonp
title: Protocol Plugin - Jsonp
sidebar_label: Protocol - Jsonp
---

Makes jsonp request.
Uses `fetch-jsonp` library.

```
requestParams:
     url {string}
     query {object}
     queryNoCache {object} - query which wont be used in generating cache key
     jsonp {object} - configuration for `fetch-jsonp`
```
