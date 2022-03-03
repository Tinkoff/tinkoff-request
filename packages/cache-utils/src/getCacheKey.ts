import prop from '@tinkoff/utils/object/prop';
import type { Context } from '@tinkoff/request-core';
import { CACHE } from './constants/metaTypes';
import defaultCacheKey from './cacheKey';

export default (context: Context, cacheKey = defaultCacheKey): string => {
    let key = prop('key', context.getInternalMeta(CACHE));

    if (!key) {
        key = cacheKey(context.getRequest());

        context.updateInternalMeta(CACHE, {
            key,
        });
    }

    return key;
};
