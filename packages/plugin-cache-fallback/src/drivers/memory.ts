import LRUCache, { Options } from '@tinkoff/lru-cache-nano';
import { Response } from '@tinkoff/request-core';
import { CacheDriver } from '../types';

export const driver = ({
    lruOptions = { max: 1000 },
    memoryConstructor = (options) => new (require('@tinkoff/lru-cache-nano'))(options),
}: {
    lruOptions?: Options<string, Response>;
    memoryConstructor?: (options: Options<string, Response>) => LRUCache<string, Response>;
} = {}): CacheDriver => {
    const cache = memoryConstructor(lruOptions);

    return {
        get(key) {
            return cache.get(key);
        },
        set(key, response) {
            cache.set(key, response);
        },
    };
};
