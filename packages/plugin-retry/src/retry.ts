import applyOrReturn from '@tinkoff/utils/function/applyOrReturn';
import { Plugin, Status } from '@tinkoff/request-core';
import { RETRY_META } from './constants';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        retry?: number;
        retryDelay?: number | ((attempt: number) => number);
    }
}

/**
 * Retries failed requests
 *
 * requestParams:
 *      retry {number} - number of attempts to execute failed request
 *      retryDelay {number | Function} - time in ms to wait before execute new attempt
 *
 * metaInfo:
 *      retry.attempts {number} - number of executed attempts
 *
 * @param {number} [retry = 0] - number of attempts to execute failed request
 * @param {number | Function} [retryDelay = 100] - time in ms to wait before execute new attempt
 * @param {number} [maxTimeout = 60000] - final timeout for complete request including retry attempts
 * @return {{init: init, error: error}}
 */
export default ({
    retry = 0,
    retryDelay = 100,
    maxTimeout = 60000,
}: {
    retry?: number;
    retryDelay?: number | ((attempt: number) => number);
    maxTimeout?: number;
} = {}): Plugin => {
    return {
        init: (context, next) => {
            context.updateInternalMeta(RETRY_META, {
                startTime: Date.now(),
            });

            next();
        },

        error: (context, next, makeRequest) => {
            const request = context.getRequest();
            const timeout = request.timeout || maxTimeout;
            const attemptsMax = request.retry ?? retry;
            const delay = request.retryDelay ?? retryDelay;
            const { startTime } = context.getInternalMeta(RETRY_META);
            let attempt = 0;

            const doRequest = () => {
                if (attempt < attemptsMax) {
                    setTimeout(() => {
                        const diffTime = Date.now() - startTime;

                        if (diffTime >= timeout) {
                            context.updateExternalMeta(RETRY_META, {
                                attempts: attempt,
                                timeout: true,
                            });

                            return next();
                        }

                        makeRequest({
                            ...request,
                            retry: 0,
                            timeout: timeout - diffTime,
                            silent: true,
                            retryDelay: undefined,
                        }).then(
                            (response) => {
                                context.updateExternalMeta(RETRY_META, {
                                    attempts: attempt + 1,
                                });

                                return next({
                                    status: Status.COMPLETE,
                                    response,
                                });
                            },
                            () => {
                                attempt++;
                                doRequest();
                            }
                        );
                    }, applyOrReturn([attempt], delay) as number);
                } else {
                    if (attemptsMax > 0) {
                        context.updateExternalMeta(RETRY_META, {
                            attempts: attempt,
                            timeout: false,
                        });
                    }

                    next();
                }
            };

            doRequest();
        },
    };
};
