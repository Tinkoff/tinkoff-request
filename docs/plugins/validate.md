---
id: validate
title: Validate Plugin
sidebar_label: Validate
---

Plugin to validate response. If `validator` returns falsy value plugin does nothing,
otherwise return value used as a error and requests goes to the error phase. If `errorValidator` returns truthy
for request in error phase then plugin switch phase to complete.

```
options:
    validator {function} - function to validate success request, accepts single parameter: the state of current request, should return error if request should be treated as errored request
    errorValidator {function} - function to validate errored request, accepts single parameter: the state of current request, should return `truthy` value if request should be treated as success request
    allowFallback {boolean} [= true] - if false adds `fallbackCache` option to request to prevent activating fallback cache
```

