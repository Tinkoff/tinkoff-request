import eachObj from '@tinkoff/utils/object/each';
import isNil from '@tinkoff/utils/is/nil';

export const serialize = (obj: Record<string, string>, init = '') => {
    const searchParams = new URLSearchParams(init);

    eachObj((v, k) => {
        if (!isNil(v)) {
            searchParams.set(k, v);
        }
    }, obj);

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
