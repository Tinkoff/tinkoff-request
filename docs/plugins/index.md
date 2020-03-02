---
id: index
title: Plugins
sidebar_label: Plugins
---
## Plugins
Plugins can inject to the request flow to change its execution or adjust request\response data. For further see [Plugin](../core/plugin) and [Request Execution](../core/execution). 

## List of plugins
1. `protocol/http` - base plugin to make request with http\https
1. `protocol/jsonp` - plugin to make jsonp requests
1. `cache/deduplicate` - deduplicate identical requests
1. `cache/memory` - caches responses into memory
1. `cache/etag` - [!server only] cache based on etag http-header
1. `cache/fallback` - [!server only] stores response data to disk and returns from cache only for errored requests
1. `cache/persistent` - [!browser only] caching data at IndexedDB to keep cache among page reloads
1. `log` - logs the data of request execution
1. `batch` - groups several request into single one
1. `validate` - validate response or restore on errors
1. `transform-url` - transforms url string for every request
1. `circuit-breaker` - [!server only] fault protections
1. `prom-red-metrics` - red metrics about sent requests for prometheus
