---
id: index
title: How to
sidebar_label: How to
---

## Write your own plugin
Plugin is just a plain object with specific keys.

Plugin interface (all entries are optional):
1. `shouldExecute(context)` - boolean function indicating is plugin should execute at current phase
1. `init(context, next, makeRequest?)` - this function will be called at `init` phase
1. `complete(context, next, makeRequest?)` - this function will be called at `complete` phase
1. `error(context, next, makeRequest?)` - this function will be called at `error` phase

`context` - the current request execution context, an object with specific methods to change request state (request data, response, error, meta data)
`next` - callback function which should be called after plugin did its job.
`makeRequest` - function to make request (it will be executed with current settings)
