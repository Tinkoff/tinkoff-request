# Change Log

## protocol-http@0.10.5
- add parsed response despite response status

## protocol-http@0.10.3
- fix usage of set-cookie header

## protocol-http@0.10.1
- fix empty query parameters

## protocol-jsonp@0.1.0
- added new plugin

## protocol-http@0.10.0
- superagent replaced with node-fetch. You may need a polyfill for fetch in browsers.
- jsonp option has moved to separate plugin: protocol-jsonp
- onProgress options has removed as it is not fully supported by fetch
- option rawQueryString has removed as it can be done by passing url concatenated with query-string

## Core@0.8.0

- Context.getMeta replaced with two methods: Context.getInternalMeta and Context.getExternalMeta
- Context.updateMeta replaced with two methods: Context.updateInternalMeta and Context.getExternalMeta
