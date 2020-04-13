---
id: execution
title: @tinkoff/request-core - Request Execution flow
sidebar_label: Request execution
---

Execution flow defines how request is executed and how plugins are get called while execution.

!!!Plugins always executed in sequence mode (e.g. one by one) and order of plugins is important.

In short: @tinkoff/request-core executes `init` handlers for each plugin from first plugin to the plugin which changes status to either `complete` or `error`,
then executed handlers for new status, from current plugin (not including) to the first one (e.g. executes plugins in backward order).

If some handler for status is absent in plugin, execution just goes to next plugin in chain.

Execution of the request might be at one of three statuses:
- `init` - init status, plugins are executed first to last, until some plugin changes flow to `complete` or `error` status.
- `complete` - means successful execution, plugins are executed from the plugin which changed status to `complete` to first plugin.
- `error` - means response finished with error, plugins are executed from the plugin which changed status to `error` to first plugin.

At any status plugins can change the inner state of request or switch current status (in that case plugins placed after current plugin won't be executed)

## Example

```typescript
import request from '@tinkoff/request-core'
// ... other plugins imports

const makeRequest = request([
    plugin1, // changes status to `complete` if request is executed with option example === 'second'
    plugin2, // changes status to `error` if requests is executed with options example === 'third'
    plugin3, // changes status to `complete` any way (otherwise execution will hang if no plugin does it)
])

makeRequest({url: 'test', example: 'first' }) // will be executed one by one: plugin1.init => plugin2.init => plugin3.init => plugin2.complete => plugin1.complete.
makeRequest({url: 'test', example: 'second' }) // will be executed: plugin1.init.
makeRequest({url: 'test', example: 'third' }) // will be executed one by one: plugin1.init => plugin2.init => plugin1.error.

```

