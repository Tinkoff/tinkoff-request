import LRUCache, { Options } from 'lru-cache';
import { Response } from '@tinkoff/request-core';
import { CacheDriver } from '../types';

const memoryCacheDriver = ({
    lruOptions = { max: 1000 },
    memoryConstructor = (options) => new (require('lru-cache'))(options),
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

export default memoryCacheDriver;
