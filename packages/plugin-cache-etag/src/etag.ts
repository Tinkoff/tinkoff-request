import type LRUCache from '@tinkoff/lru-cache-nano';
import type { Options } from '@tinkoff/lru-cache-nano';
import type { Plugin, Response } from '@tinkoff/request-core';
import { Status } from '@tinkoff/request-core';
import { shouldCacheExecute, getCacheKey as getCacheKeyUtil, metaTypes } from '@tinkoff/request-cache-utils';
import { getHeader } from '@tinkoff/request-plugin-protocol-http';

import { ETAG } from './constants';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        etagCache?: boolean;
        etagCacheForce?: boolean;
    }
}

interface CacheValue {
    key: string;
    value: Response;
}

export interface EtagPluginOptions {
    lruOptions?: Options<string, CacheValue>;
    shouldExecute?: boolean;
    memoryConstructor?: (options: Options<string, CacheValue>) => LRUCache<string, CacheValue>;
    getCacheKey?: (arg) => string;
}

/**
 * Caches requests response into memory.
 * Caching is based on etag http-header: for every request which contains 'etag' header response is stored in cache, on
 * subsequent calls for the same requests it adds 'If-None-Match' header and checks for 304 status of response - if status
 * is 304 response returns from cache.
 *
 * Uses library `@tinkoff/lru-cache-nano` as memory storage.
 *
 * requestParams:
 *      etagCache {boolean} - disable this plugin at all
 *      etagCacheForce {boolean} - plugin will only be executed on complete phase
 *
 * metaInfo:
 *      etagCache {boolean} - is current request was returned from this cache
 *
 * @param {object} [lruOptions = {max: 1000}] - options passed to @tinkoff/lru-cache-nano library
 * @param {boolean} [shouldExecute = true] is plugin activated by default
 * @param {function} memoryConstructor cache factory
 * @param {function} getCacheKey function used for generate cache key
 */
export default ({
    lruOptions = { max: 1000 },
    shouldExecute = true,
    memoryConstructor = (options) => new (require('@tinkoff/lru-cache-nano'))(options),
    getCacheKey = undefined,
}: EtagPluginOptions = {}): Plugin => {
    const lruCache = memoryConstructor({
        ...lruOptions,
        allowStale: true, // should be true for the opportunity to control it for individual requests
    });

    return {
        shouldExecute: shouldCacheExecute('etag', shouldExecute),

        init: (context, next) => {
            const cacheKey = getCacheKeyUtil(context, getCacheKey);

            if (lruCache.has(cacheKey)) {
                const { key, value } = lruCache.get(cacheKey);
                const request = context.getRequest();

                context.updateInternalMeta(ETAG, {
                    value,
                });

                return next({
                    request: {
                        ...request,
                        headers: {
                            ...request.headers,
                            'If-None-Match': key,
                        },
                    },
                });
            }

            next();
        },
        complete: (context, next) => {
            const cacheKey = getCacheKeyUtil(context, getCacheKey);
            const etag = getHeader(context as any, 'etag');

            if (etag) {
                lruCache.set(cacheKey, {
                    key: etag,
                    value: context.getResponse(),
                });
            }

            next();
        },
        error: (context, next) => {
            const { error } = context.getState();

            if ((error as any).status === 304) {
                const { value = null } = context.getInternalMeta(ETAG) || {};

                if (value) {
                    context.updateExternalMeta(metaTypes.CACHE, {
                        etagCache: true,
                    });

                    return next({
                        status: Status.COMPLETE,
                        response: value,
                    });
                }
            }

            next();
        },
    };
};
