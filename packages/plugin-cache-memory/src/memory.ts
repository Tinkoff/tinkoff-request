import prop from '@tinkoff/utils/object/prop';
import propOr from '@tinkoff/utils/object/propOr';

import type LRUCache from '@tinkoff/lru-cache-nano';
import type { Options } from '@tinkoff/lru-cache-nano';
import type { Plugin, Response } from '@tinkoff/request-core';
import { Status } from '@tinkoff/request-core';
import { shouldCacheExecute, getCacheKey as getCacheKeyUtil, metaTypes } from '@tinkoff/request-cache-utils';

import { getStaleBackgroundRequestTimeout } from './utils';

const CACHE_DEFAULT_TTL = 300000; // 5 min

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        memoryCache?: boolean;
        memoryCacheForce?: boolean;
        memoryCacheTtl?: number;
    }
}

export interface MemoryPluginOptions {
    lruOptions?: Options<string, Response>;
    shouldExecute?: boolean;
    allowStale?: boolean;
    staleTtl?: number;
    staleBackgroundRequestTimeout?: number;
    memoryConstructor?: (options: Options<string, Response>) => LRUCache<string, Response>;
    getCacheKey?: (arg) => string;
}

/**
 * Caches requests response into memory.
 * Uses library `@tinkoff/lru-cache-nano` as memory storage.
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
 * @param {object} [lruOptions = {max: 1000, ttl: 300000}] - options passed to @tinkoff/lru-cache-nano library
 * @param {boolean} [shouldExecute = true] is plugin activated by default
 * @param {boolean} [allowStale = false] is allowed to use outdated value from cache
 *      (if true outdated value will be returned and request to update it will be run in background)
 * @param {number} [staleTtl = lruOptions.ttl] time in ms while outdated value is preserved in cache while
 *       executing background update
 * @param {number} [staleBackgroundRequestTimeout] time in ms for background request timeout for the stale response
 * @param {function} memoryConstructor cache factory
 * @param {function} getCacheKey function used for generate cache key
 */
export default ({
    lruOptions = { max: 1000, ttl: CACHE_DEFAULT_TTL } as Options<string, Response>,
    shouldExecute = true,
    allowStale = false,
    staleTtl = 'ttl' in lruOptions ? lruOptions.ttl : CACHE_DEFAULT_TTL,
    staleBackgroundRequestTimeout = undefined,
    memoryConstructor = (options: Options<string, Response>) => new (require('@tinkoff/lru-cache-nano'))(options),
    getCacheKey = undefined,
}: MemoryPluginOptions = {}): Plugin => {
    const lruCache: LRUCache<string, Response> = memoryConstructor({
        ...lruOptions,
        allowStale: true, // should be true for the opportunity to control it for individual requests
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

                lruCache.set(cacheKey, outdated, { ttl: staleTtl }); // remember outdated value, to prevent losing it
                setTimeout(
                    () =>
                        makeRequest({
                            ...request,
                            timeout: getStaleBackgroundRequestTimeout({
                                requestTimeout: request.timeout,
                                configTimeout: staleBackgroundRequestTimeout,
                            }),
                            memoryCacheForce: true,
                            memoryCacheBackground: true,
                            // ignore any abort properties to the request in the background
                            // as if abortSignal aborts background request we won't update cache
                            // and will try to update it in next requests over and over again.
                            // Also we are not blocking main execution anyway
                            // to care about execution timings in that case
                            signal: undefined,
                            abortPromise: undefined
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
            const ttl: number = prop('memoryCacheTtl', context.getRequest());

            lruCache.set(cacheKey, context.getResponse(), { ttl });

            context.updateExternalMeta(metaTypes.CACHE, {
                memoryCacheBackground: prop('memoryCacheBackground', context.getRequest()),
            });

            next();
        },
    };
};
