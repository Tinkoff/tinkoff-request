import nothing from '@tinkoff/utils/function/nothing';
import type { Plugin, ContextState } from '@tinkoff/request-core';
import { Status } from '@tinkoff/request-core';
import { VALIDATE } from './constants';

interface Validator {
    (state: ContextState): any;
}

interface Options {
    allowFallback?: boolean;
    validator?: Validator;
    errorValidator?: Validator;
}

/**
 * Plugin to validate response. If `validator` returns falsy value plugin does nothing,
 * otherwise return value used as a error and requests goes to the error phase. If `errorValidator` returns truthy
 * for request in error phase then plugin switch phase to complete.
 *
 * @param {function} validator - function to validate success request, accepts single parameter: the state of current request,
 *                               should return error if request should be treated as errored request
 * @param {function} errorValidator - function to validate errored request, accepts single parameter: the state of current request,
 *                                    should return `truthy` value if request should be treated as success request
 * @param {boolean} [allowFallback = true] - if false adds `fallbackCache` option to request to prevent activating fallback cache
 * @return {{complete: complete}}
 */
export default ({ validator = nothing, allowFallback = true, errorValidator = nothing }: Options = {}): Plugin => ({
    complete: (context, next) => {
        const state = context.getState();
        const { request } = state;
        const error = validator(state);

        context.updateExternalMeta(VALIDATE, {
            validated: !error,
        });

        if (error) {
            return next({
                error,
                request: allowFallback
                    ? request
                    : {
                          ...request,
                          fallbackCache: false,
                      },
                status: Status.ERROR,
            });
        }

        return next();
    },
    error: (context, next) => {
        const state = context.getState();
        const isSuccess = errorValidator(state);

        context.updateExternalMeta(VALIDATE, {
            errorValidated: !!isSuccess,
        });

        if (isSuccess) {
            context.updateExternalMeta(VALIDATE, {
                error: state.error,
            });

            return next({
                error: null,
                status: Status.COMPLETE,
            });
        }

        return next();
    },
});
