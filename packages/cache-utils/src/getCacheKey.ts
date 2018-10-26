import prop from '@tinkoff/utils/object/prop';
import { Context } from '@tinkoff/request-core';
import { CACHE } from './constants/metaTypes';
import defaultCacheKey from './cacheKey';
import md5 from './md5';

const KEY_LIMIT = 100;

export default (context: Context, cacheKey = defaultCacheKey) => {
    let key = prop('key', context.getMeta(CACHE));

    if (!key) {
        const generatedKey = cacheKey(context.getRequest());

        key = generatedKey.length > KEY_LIMIT ? md5(generatedKey) : generatedKey;

        context.updateMeta(CACHE, {
            key
        });
    }

    return key;
};
