---
id: index
title: Plugins
sidebar_label: Plugins
---
## Plugins
Plugins can inject to the request flow to change its execution or adjust request\response data.

## List of plugins
1. `protocol/http` - base plugin to make request, based on [superagent](https://www.npmjs.com/package/superagent)
1. `cache/deduplicate` - deduplicate identical requests
1. `cache/memory` - caches responses into memory
1. `cache/etag` - [!server only] cache based on etag http-header
1. `cache/fallback` - [!server only] stores response data to disk and returns from cache only for errored requests
1. `cache/persistent` - [!browser only] caching data at IndexedDB to keep cache among page reloads
1. `log` - logs the data of request execution
1. `batch` - groups several request into single one
1. `validate` - validate response
1. `circuit-breaker` - [!server only] fault protections

## Plugin flow execution
1. init - init phase, plugins are executed first to last, until some plugin changes flow to `complete` or `error` phase.
1. complete - means successful execution, plugins are executed from the plugin which changed phase to `complete` to first plugin.
1. error - means response ended with error, plugins are executed from the plugin which changed phase to `error` to first plugin.

!!!The order of plugins is important.

At any phase plugins can change the inner state of request or switch current phase (in that case plugins placed after such plugin won't be executed)
(Example: in request constructor were passed 5 plugins and in `init` phase the 3-rd plugin changed phase to `complete` - it means init-action will be executed for plugins 1, 2, 3, and complete-action for 1, 2).
Request execution is finished only when current request phase is `complete` or `error` and none of plugins switched the phase.

