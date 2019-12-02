---
id: context
title: @tinkoff/request-core - Context
sidebar_label: Context
---

Special class for storing state of the request. The instance of this class created by @tinkof/request-core for every request and get passed to each plugin.
It is contains current state (e.g. status, request, response, error) and meta data for plugins.

Meta data for plugins might be either internal or external and only used by plugins (purpose of that division is that external meta usually logged by @tinkoff/request-plugin-log for debbugging purpose, while internal meta is not).

## Methods

### getState()

Return current state of the request, with following properties:
- `status` - status of the current request execution, either 'init', 'complete' or 'error'
- `request` - property is set by @tinkoff/request-core, and equal to options passed while making request
- `response` - property is set by plugins and will be used as the result of the request if execution has succeeded (might be null if request in progress, on not succeeded)
- `error` - property is set either by plugins or by @tinkoff/request-core if plugin execution failed, and contains current error (equal to null for success requests)
- any additional properties set by plugins

### setState(obj)

Current state of the context will be shallow merged with passed argument and the result will be set as new state.

### getStatus()

Alias for `context.getState().status`

### getRequest()

Alias for `context.getState().request`

### getResponse()

Alias for `context.getState().response`

### getInternalMeta(metaName?)

Get the internal meta data by specific name, if name is not defined return all internal meta;

### getExternalMeta(metaName?)

Get the external meta data by specific name, if name is not defined return all external meta;

### updateInternalMeta(name, obj)

Extend internal meta for specific name by passed obj.

### updateExternalMeta

Extend external meta for specific name by passed obj.

