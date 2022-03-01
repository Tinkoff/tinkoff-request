import type { Plugin } from '@tinkoff/request-core';
import { getCacheKey as getCacheKeyUtil, shouldCacheExecute, metaTypes } from '@tinkoff/request-cache-utils';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        deduplicateCache?: boolean;
        deduplicateCacheForce?: boolean;
    }
}

/**
 * Deduplicate requests with equal cache keys before making a request
 *
 * requestParams:
 *      deduplicateCache {boolean} - disable this plugin at all
 *      deduplicateCacheForce {boolean} - plugin will only be executed on complete phase
 *
 * metaInfo:
 *      deduplicated {boolean} - is current request was deduplicated (is not set for the first request of equals requests)
 *
 * @param {boolean} [shouldExecute = true] is plugin activated by default
 * @param {function} getCacheKey function used for generate cache key
 */
export default ({ shouldExecute = true, getCacheKey = undefined } = {}): Plugin => {
    const activeRequests = {};

    const traverseActiveRequests = (context) => {
        const state = context.getState();
        const deduplicationKey = getCacheKeyUtil(context, getCacheKey);

        if (deduplicationKey && activeRequests[deduplicationKey]) {
            const arr = activeRequests[deduplicationKey];

            delete activeRequests[deduplicationKey];

            arr.forEach((next) => {
                next({
                    status: state.status,
                    response: state.response,
                    error: state.error,
                });
            });
        }
    };

    return {
        shouldExecute: shouldCacheExecute('deduplicate', shouldExecute),
        init: (context, next) => {
            const deduplicationKey = getCacheKeyUtil(context, getCacheKey);

            if (activeRequests[deduplicationKey]) {
                context.updateExternalMeta(metaTypes.CACHE, {
                    deduplicated: true,
                });
                activeRequests[deduplicationKey].push(next);
                return;
            }

            activeRequests[deduplicationKey] = [];
            next();
        },
        complete: (context, next) => {
            traverseActiveRequests(context);
            next();
        },
        error: (context, next) => {
            traverseActiveRequests(context);
            next();
        },
    };
};
