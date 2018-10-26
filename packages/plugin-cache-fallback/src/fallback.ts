import noop from '@tinkoff/utils/function/noop';
import T from '@tinkoff/utils/function/T';

import { Plugin, Status } from '@tinkoff/request-core';
import { shouldCacheExecute, getCacheKey as getCacheKeyUtil, metaTypes } from '@tinkoff/request-cache-utils';

/**
 * Hard drive cache. This cache used only if request ends with error response and returns previous success response from cache.
 * Works only on server-side, in browser does nothing.
 *
 * requestParams:
 *      fallbackCache {boolean} - disable this plugin at all
 *      fallbackCacheForce {boolean} - plugin will only be executed on complete phase
 *
 * metaInfo:
 *      fallback {boolean} - is current request was returned from fallback
 *
 * @param {boolean} [shouldExecute = true] is plugin activated by default
 * @param {function} shouldFallback should fallback value be returned from cache
 * @param {function} getCacheKey function used for generate cache key
 */
export default ({
    shouldExecute = true,
    shouldFallback = T,
    getCacheKey = undefined,
} = {}) : Plugin => {
    const persistentCache = require('../persistent-cache').default; // eslint-disable-line global-require
    const fallbackFileCache = persistentCache({ name: 'fallback', base: './.tmp/server-cache/', memory: false });

    return {
        shouldExecute: shouldCacheExecute('fallback', shouldExecute),
        complete: (context, next) => {
            const cacheKey = getCacheKeyUtil(context, getCacheKey);

            fallbackFileCache.put(encodeURIComponent(cacheKey), context.getResponse(), noop);
            next();
        },
        error: (context, next) => {
            if (!shouldFallback(context.getState())) {
                return next();
            }

            const cacheKey = getCacheKeyUtil(context, getCacheKey);

            fallbackFileCache.get(encodeURIComponent(cacheKey), (err, result) => {
                if (!err && result) {
                    context.updateMeta(metaTypes.CACHE, {
                        fallbackCache: true
                    });

                    return next({
                        status: Status.COMPLETE,
                        response: result
                    });
                }

                next();
            });
        }
    };
};
