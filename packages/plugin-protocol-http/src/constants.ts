export const PROTOCOL_HTTP = 'PROTOCOL_HTTP';

export const HttpMethods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    HEAD: 'HEAD',
    PATCH: 'PATCH',
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
