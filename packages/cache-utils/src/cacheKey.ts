import { Request } from '@tinkoff/request-core';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        rawQueryString?: string;
        additionalCacheKey?: any;
    }
}

export default ({ httpMethod = 'GET', url, payload, query, rawQueryString = '', additionalCacheKey = '' }: Request) =>
    httpMethod.toLowerCase() +
    url +
    JSON.stringify(payload || '') +
    JSON.stringify(query || '') +
    rawQueryString +
    JSON.stringify(additionalCacheKey);
