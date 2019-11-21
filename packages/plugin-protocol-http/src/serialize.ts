import { serialize as serializeQuery } from './url';

export const serialize = (type: string, payload) => {
    switch (type) {
        case 'form':
        case 'urlencoded':
        case 'form-data':
            return serializeQuery(payload);
        case 'json':
            return JSON.stringify(payload);
        default:
            return payload;
    }
};
