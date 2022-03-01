import isFunction from '@tinkoff/utils/is/function';
import T from '@tinkoff/utils/function/T';
import type { ContextState, Plugin, RequestError } from '@tinkoff/request-core';
import { Status } from '@tinkoff/request-core'
import { CIRCUIT_BREAKER_META } from './constants';
import { CircuitBreakerOptions, CircuitBreaker } from './CircuitBreaker';
import { CircuitBreakerError } from './errors';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface RequestErrorCode {
        ERR_CIRCUIT_BREAKER_OPEN: 'ERR_CIRCUIT_BREAKER_OPEN';
    }
}

export interface Options extends Partial<CircuitBreakerOptions> {
    getKey?: (state: ContextState) => string;
    isSystemError?: (error: RequestError) => boolean;
}

/**
 * Plugin implementing `Circuit Breaker` design pattern. Request maker will have 3 states:
 * `Closed` - all requests are passing to the next plugin allowing to create requests
 * `Open` - no requests are passing to next step, every request throws error from last 'real' request
 * `Half-Open` - only limited number of requests are allowed to actually executes, if these requests were successful
 * state changes to Closed, otherwise goes back to Open
 *
 * metaInfo:
 *      open {boolean} - is current request was block by Circuit Breaker
 *
 * @param {Function} [getKey=() => ''] allow to divide requests to different instances of Circuit Breaker, by default
 *              only one Circuit Breaker instance is created
 * @param {Function} [isSystemError=() => true] specifies that error should be treated as a system error and therefore will lead to an increasing counter of failed requests in Circuit Breaker,
 *              if the error is not a system error then error is treated as normal behavior and therefore will lead to a decreasing counter of failed requests
 * @param {number} [failureTimeout=60000] time interval in which failed requests will considered to get state
 * @param {number} [failureThreshold=50] percentage of failed requests inside `failureTimeout` interval, if that number is exceeded state changes to Open
 * @param {number} [minimumFailureCount=5] number of minimum request which should be failed to consider stats from current time interval
 * @param {number} [openTimeout=30000] time interval in which all requests will forcedly fail,
 *               after that timeout `halfOpenThreshold` number of requests will be executed as usual
 * @param {number} [halfOpenThreshold=5] percentage of requests allowed to execute while state is Half-Open
 */
export default (
    {
        getKey,
        isSystemError = T,
        failureTimeout = 60000,
        failureThreshold = 50,
        openTimeout = 30000,
        halfOpenThreshold = 5,
        minimumFailureCount = 5,
    }: Options = {} as Options
): Plugin => {
    let getBreaker: (state: ContextState) => CircuitBreaker;

    if (isFunction(getKey)) {
        const registry = new Map<string, CircuitBreaker>();

        getBreaker = (state: ContextState) => {
            const key = getKey(state) || '';
            let breaker = registry.get(key);

            if (!breaker) {
                breaker = new CircuitBreaker({
                    failureTimeout,
                    failureThreshold,
                    openTimeout,
                    halfOpenThreshold,
                    minimumFailureCount,
                });
                registry.set(key, breaker);
            }

            return breaker;
        };
    } else {
        const circuitBreaker = new CircuitBreaker({
            failureTimeout,
            failureThreshold,
            minimumFailureCount,
            openTimeout,
            halfOpenThreshold,
        });
        getBreaker = () => circuitBreaker;
    }

    return {
        init: (context, next) => {
            const state = context.getState();
            const breaker = getBreaker(state);

            if (breaker.shouldThrow()) {
                context.updateExternalMeta(CIRCUIT_BREAKER_META, {
                    open: true,
                });

                return next({
                    status: Status.ERROR,
                    error: new CircuitBreakerError(breaker.getError()),
                });
            }

            context.updateInternalMeta(CIRCUIT_BREAKER_META, {
                breaker,
            });
            next();
        },
        complete: (context, next) => {
            const { breaker } = context.getInternalMeta(CIRCUIT_BREAKER_META) as { breaker: CircuitBreaker };

            breaker.success();
            next();
        },
        error: (context, next) => {
            const { breaker } = context.getInternalMeta(CIRCUIT_BREAKER_META) as { breaker: CircuitBreaker };
            const { error } = context.getState();

            if (isSystemError(error)) {
                breaker.failure(error);
            } else {
                breaker.success();
            }
            next();
        },
    };
};
