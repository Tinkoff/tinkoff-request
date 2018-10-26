---
id: log
title: Log Plugin
sidebar_label: Log
---

Logs request events and timing

```
options:
     name {string} - name of log
     logger {Function} - logger factory

requestParams:
     silent {boolean}

metaInfo:
     log.start {number} - request start Date.now()
     log.end {number} - request end Date.now()
     log.duration {number} - request duration (end - start)
```

