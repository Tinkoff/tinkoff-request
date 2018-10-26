import prop from '@tinkoff/utils/object/prop';
import { Context } from '@tinkoff/request-core';
import { CACHE } from './constants/metaTypes';
import defaultCacheKey from './cacheKey';

export default (context: Context, cacheKey = defaultCacheKey) => {
    let key = prop('key', context.getMeta(CACHE));

    if (!key) {
        key = cacheKey(context.getRequest());

        context.updateMeta(CACHE, {
            key,
        });
    }

    return key;
};
