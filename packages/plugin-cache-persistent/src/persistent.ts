import { Status, Plugin } from '@tinkoff/request-core';
import { shouldCacheExecute, getCacheKey as getCacheKeyUtil, metaTypes } from '@tinkoff/request-cache-utils';

/**
 * Caches requests result into IndexedDB.
 * Uses library `idb-keyval` as wrapper to IndexedDB.
 * Works only in browsers with support of IndexedDB, otherwise does nothing.
 *
 * requestParams:
 *      persistentCache {boolean} - disable this plugin at all
 *      persistentCacheForce {boolean} - plugin will only be executed on complete phase
 *
 * metaInfo:
 *      persistentCache {boolean} - is current request was returned from this cache
 *
 * @param {boolean} [shouldExecute = true] is plugin activated by default
 * @param {function} getCacheKey function used for generate cache key
 */
export default ({
    shouldExecute = true,
    getCacheKey = undefined,
} = {}) : Plugin => {
    if (typeof window !== 'undefined' && window.indexedDB) {
        const { get, set, Store } = require('idb-keyval'); // eslint-disable-line global-require
        const store = new Store('tinkoff-cache', 'persistent');

        return {
            shouldExecute: shouldCacheExecute('persistent', shouldExecute),
            init: (context, next) => {
                const cacheKey = getCacheKeyUtil(context, getCacheKey);

                get(cacheKey, store)
                    .then(value => {
                        if (value) {
                            context.updateMeta(metaTypes.CACHE, {
                                persistentCache: true
                            });
                            return next({
                                status: Status.COMPLETE,
                                response: value
                            });
                        }

                        next();
                    })
                    .catch(err => {
                        next();
                    });
            },
            complete: (context, next) => {
                const cacheKey = getCacheKeyUtil(context, getCacheKey);

                set(cacheKey, context.getResponse(), store);

                next();
            }
        };
    }

    return {};
};
