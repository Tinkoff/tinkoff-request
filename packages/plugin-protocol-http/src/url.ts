import eachObj from '@tinkoff/utils/object/each';
import isNil from '@tinkoff/utils/is/nil';
import isObject from '@tinkoff/utils/is/object';
import reduceArr from '@tinkoff/utils/array/reduce';

export const serialize = (obj: Record<string, any>, init = '') => {
    const searchParams = new URLSearchParams(init);

    const setParams = (params: Record<string, any>, keys: string[] = []) => {
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

export const addQuery = (url: string, query: Record<string, string>) => {
    const [path, search] = url.split('?', 2);
    const serialized = serialize(query, search);

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
