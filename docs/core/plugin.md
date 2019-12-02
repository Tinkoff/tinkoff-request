---
id: plugin
title: Plugin definition
sidebar_label: Plugin
---

Plugin is just a plain object with specific methods.

Plugin interface (all entries are optional):
- `shouldExecute(context)` - boolean function indicating is plugin should execute at current status
- `init(context, next, makeRequest?)` - this function will be called at `init` status
- `complete(context, next, makeRequest?)` - this function will be called at `complete` status
- `error(context, next, makeRequest?)` - this function will be called at `error` status

Where arguments are:
- `context` - the current request execution context, see [Context](./context)
- `next` - callback function which should be called after plugin did its job.
- `makeRequest` - function to make request (it will be executed with current request library settings)

## Example

```typescript
import request from '@tinkoff/request-core';

const plugin = {
    shouldExecute: (context) => {
        return context.getRequest().log === true;
    },
    init: (context, next) => {
        setTimeout(() => {
            context.updateExternalMeta('my-plugin', { log: true }); // update meta for easier debugging
            console.debug(context.getRequest()); // log request settings
            next(); // next plugin wont be executed until `next` get called
        }, 1000)
    },
    complete: (context, next) => {
        console.log(context.getResponse()); // log response value
        next();
    },
    error: (context, next, makeRequest) => {
        const { error } = context.getState(); 
        
        makeRequest({ // execute request, it is same as calling `req`, but plugins usually are defined in different module, so it is just a helpful option 
            url: './error-reporter', 
            payload: error, 
            log: false, // disable this plugin from logging, otherwise call to ./error-reporter will be logged by this.plugin
        }).finally(next); // calling next is neccessary
    }
}

const req = request([
    plugin, // plugins order is important, see 'Request exection' doc
    //...other plugins
])

req({url: 'test', log: true}); // enable our plugin, the request info will be logged
req({url: 'test'}); // log options is ommited so our plugin wont be executed
```
