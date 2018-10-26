import nothing from '@tinkoff/utils/function/nothing';
import { Plugin, Status } from '@tinkoff/request-core';

/**
 * Plugin to validate response, if `validator` returns falsy value plugin does nothing,
 * otherwise return value used as a error and requests goes to the error phase
 *
 * @param {function} validator - function to validate request, accepts single parameter: the state of current request
 * @param {boolean} [allowFallback = true] - if false adds `fallbackCache` option to request to prevent activating fallback cache
 * @return {{complete: complete}}
 */
export default ({ validator = nothing, allowFallback = true } = {}): Plugin => ({
    complete: (context, next) => {
        const state = context.getState();
        const { request } = state;
        const error = validator(state);

        if (error) {
            return next({
                error,
                request: allowFallback ? request : {
                    ...request,
                    fallbackCache: false
                },
                status: Status.ERROR,
            });
        }

        next();
    }
});
