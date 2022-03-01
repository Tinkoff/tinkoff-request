import noop from '@tinkoff/utils/function/noop';
import T from '@tinkoff/utils/function/T';

import type { Plugin, ContextState, Request } from '@tinkoff/request-core';
import { Status } from '@tinkoff/request-core';
import { shouldCacheExecute, getCacheKey as getCacheKeyUtil, metaTypes } from '@tinkoff/request-cache-utils';
import { CacheDriver } from './types';
import { fsCacheDriver } from './drivers';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        fallbackCache?: boolean;
        fallbackCacheForce?: boolean;
    }
}

/**
 * Fallback cache plugin. This cache used only if request ends with error response and returns previous success response from cache.
 * Actual place to store cache data depends on passed driver (file system by default).
 *
 * requestParams:
 *      fallbackCache {boolean} - disable this plugin at all
 *      fallbackCacheForce {boolean} - plugin will only be executed on complete phase
 *
 * metaInfo:
 *      fallbackCache {boolean} - is current request was returned from fallback
 *
 * @param {boolean} [shouldExecute = true] is plugin activated by default
 * @param {function} shouldFallback should fallback value be returned from cache
 * @param {function} getCacheKey function used for generate cache key
 * @param {CacheDriver} [driver = fsCacheDriver] driver used to store fallback data
 */
export default ({
    shouldExecute = true,
    shouldFallback = T,
    getCacheKey,
    driver = fsCacheDriver(),
}: {
    shouldExecute?: boolean;
    shouldFallback?: (state: ContextState) => boolean;
    getCacheKey?: (request: Request) => string;
    driver?: CacheDriver;
} = {}): Plugin => {
    if (!driver) {
        return {};
    }

    return {
        shouldExecute: shouldCacheExecute('fallback', shouldExecute),
        complete: (context, next) => {
            const cacheKey = getCacheKeyUtil(context, getCacheKey);

            Promise.resolve()
                .then(() => driver.set(cacheKey, context.getResponse()))
                .catch(noop)
                .then(() => next());
        },
        error: (context, next) => {
            if (!shouldFallback(context.getState())) {
                return next();
            }

            const cacheKey = getCacheKeyUtil(context, getCacheKey);

            Promise.resolve()
                .then(() => driver.get(cacheKey))
                .then((response) => {
                    if (!response) {
                        return next();
                    }

                    context.updateExternalMeta(metaTypes.CACHE, {
                        fallbackCache: true,
                    });

                    next({
                        status: Status.COMPLETE,
                        response,
                    });
                })
                .catch(() => next());
        },
    };
};
