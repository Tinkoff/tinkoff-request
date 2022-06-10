import eachObj from '@tinkoff/utils/object/each';
import isNil from '@tinkoff/utils/is/nil';
import isObject from '@tinkoff/utils/is/object';
import reduceArr from '@tinkoff/utils/array/reduce';
import { Query } from './types';

export const serializeQuery = (obj: Query, init = '') => {
    const searchParams = new URLSearchParams(init);

    const setParams = (params: object, keys: string[] = []) => {
        eachObj((v, k) => {
            if (isNil(v)) return;

            const arr = keys.length ? [...keys, k] : [k];

            if (isObject(v)) {
                setParams(v, arr);
            } else {
                searchParams.set(
                    reduceArr((acc, curr, i) => (i ? `${acc}[${curr}]` : curr), '', arr),
                    v
                );
            }
        }, params);
    };

    setParams(obj);

    return searchParams.toString();
};

export const addQuery = (url: string, query: Query) => {
    const [path, search] = url.split('?', 2);
    const serialized = serializeQuery(query, search);

    if (!serialized) {
        return path;
    }

    return `${path}?${serialized}`;
};

export const normalizeUrl = (url: string) => {
    if (typeof window === 'undefined' && !/^https?:\/\//.test(url)) {
        return `http://${url}`;
    }

    return url;
};
