import { Request } from '@tinkoff/request-core';

export default ({
    httpMethod = 'GET',
    url,
    payload = '',
    query = '',
    rawQueryString = '',
    additionalCacheKey = '',
}: Request) =>
    httpMethod.toLowerCase() +
    url +
    JSON.stringify(payload) +
    JSON.stringify(query) +
    rawQueryString +
    JSON.stringify(additionalCacheKey);
