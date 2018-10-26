---
id: validate
title: Validate Plugin
sidebar_label: Validate
---

Plugin to validate response, if `validator` returns falsy value plugin does nothing,
otherwise return value used as a error and requests goes to the error phase

```
options:
    validator {function} - function to validate request, accepts single parameter: the state of current request
    allowFallback {boolean} [= true] - if false adds `fallbackCache` option to request to prevent activating fallback cache
```

