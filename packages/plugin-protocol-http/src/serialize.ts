import { serializeQuery } from '@tinkoff/request-url-utils';

export const serialize = (type: string, payload, querySerializer = serializeQuery) => {
    switch (type) {
        case 'form':
        case 'urlencoded':
        case 'form-data':
            return querySerializer(payload);
        case 'json':
            return JSON.stringify(payload);
        default:
            return payload;
    }
};
