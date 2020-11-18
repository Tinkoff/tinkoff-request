import prop from '@tinkoff/utils/object/prop';
import propOr from '@tinkoff/utils/object/propOr';

import { Plugin, Status } from '@tinkoff/request-core';
import { shouldCacheExecute, getCacheKey as getCacheKeyUtil, metaTypes } from '@tinkoff/request-cache-utils';

const CACHE_DEFAULT_TTL = 300000; // 5 min

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        memoryCache?: boolean;
        memoryCacheForce?: boolean;
        memoryCacheTtl?: number;
    }
}

/**
 * Caches requests response into memory.
 * Uses library `lru-cache` as memory storage.
 *
 * requestParams:
 *      memoryCache {boolean} - disable this plugin at all
 *      memoryCacheForce {boolean} - plugin will only be executed on complete phase
 *      memoryCacheTtl {number} - ttl of cache of the current request
 *      memoryCacheAllowStale {boolean} - is allowed to use outdated value from cache
 *          (if true outdated value will be returned and request to update it will be run in background)
 *
 * metaInfo:
 *      memoryCache {boolean} - is current request was returned from this cache
 *      memoryCacheOutdated {boolean} - is value in cache is outdated (only for plugin with allowStale = true)
 *
 * @param {object} [lruOptions = {max: 1000, maxAge: 300000}] - options passed to lru-cache library
 * @param {boolean} [shouldExecute = true] is plugin activated by default
 * @param {boolean} [allowStale = false] is allowed to use outdated value from cache
 *      (if true outdated value will be returned and request to update it will be run in background)
 * @param {number} [staleTtl = lruOptions.maxAge] time in ms while outdated value is preserved in cache while
 *       executing background update
 * @param {function} memoryConstructor cache factory
 * @param {function} getCacheKey function used for generate cache key
 */
export default ({
    lruOptions = { max: 1000, maxAge: CACHE_DEFAULT_TTL },
    shouldExecute = true,
    allowStale = false,
    staleTtl = lruOptions.maxAge || CACHE_DEFAULT_TTL,
    memoryConstructor = (options) => new (require('lru-cache'))(options),
    getCacheKey = undefined,
} = {}): Plugin => {
    const lruCache = memoryConstructor({
        ...lruOptions,
        stale: true, // should be true for the opportunity to control it for individual requests
    });

    return {
        shouldExecute: shouldCacheExecute('memory', shouldExecute),

        init: (context, next, makeRequest) => {
            const cacheKey = getCacheKeyUtil(context, getCacheKey);

            if (lruCache.has(cacheKey)) {
                context.updateExternalMeta(metaTypes.CACHE, {
                    memoryCache: true,
                    memoryCacheOutdated: false,
                });

                return next({
                    status: Status.COMPLETE,
                    response: lruCache.get(cacheKey),
                });
            }

            const allowOutdated = propOr('memoryCacheAllowStale', allowStale, context.getRequest());
            const outdated = allowOutdated && lruCache.peek(cacheKey);

            if (outdated) {
                const request = context.getRequest();

                context.updateExternalMeta(metaTypes.CACHE, {
                    memoryCache: true,
                    memoryCacheOutdated: true,
                });

                lruCache.set(cacheKey, outdated, staleTtl); // remember outdated value, to prevent losing it
                setTimeout(
                    () =>
                        makeRequest({
                            ...request,
                            memoryCacheForce: true,
                            memoryCacheBackground: true,
                        }).catch(() => {
                            // do nothing here because sub request have all logging stuff
                        }),
                    15
                ); // run background request to update cache

                return next({
                    status: Status.COMPLETE,
                    response: outdated,
                });
            }

            next();
        },
        complete: (context, next) => {
            const cacheKey = getCacheKeyUtil(context, getCacheKey);
            const ttl = prop('memoryCacheTtl', context.getRequest());

            lruCache.set(cacheKey, context.getResponse(), ttl);

            context.updateExternalMeta(metaTypes.CACHE, {
                memoryCacheBackground: prop('memoryCacheBackground', context.getRequest()),
            });

            next();
        },
    };
};
