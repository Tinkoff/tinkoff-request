export const PROTOCOL_HTTP = 'PROTOCOL_HTTP';

export const HttpMethods = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    HEAD: 'head',
} as const;

export const REQUEST_TYPES = {
    html: 'text/html',
    json: 'application/json',
    xml: 'text/xml',
    urlencoded: 'application/x-www-form-urlencoded',
    form: 'application/x-www-form-urlencoded',
    'form-data': 'application/x-www-form-urlencoded',
    'multipart/form-data': '',
};
