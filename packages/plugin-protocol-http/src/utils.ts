import { MakeRequestResult } from '@tinkoff/request-core';
import prop from '@tinkoff/utils/object/prop';
import { PROTOCOL_HTTP } from './constants';

const getSetCookieHeader = (headers) => {
    if (typeof window === 'undefined') {
        return headers.raw()['set-cookie']; // node-fetch specific api, see https://github.com/bitinn/node-fetch#extract-set-cookie-header
    }

    return []; // browser doesn't provide set-cookie header, just return empty array for compatibility
};

// TODO: when some plugins (for example cache) break flow, plugin-http won't be called and meta will be empty
export const _getResponse = (request: MakeRequestResult): Response => {
    const meta = request.getInternalMeta(PROTOCOL_HTTP);

    return meta && meta.response;
};

const _getHeaders = (request: MakeRequestResult) => {
    return prop('headers', _getResponse(request));
};

export const getHeaders = (request: MakeRequestResult) => {
    const headers = _getHeaders(request);
    const result = {};

    if (headers) {
        headers.forEach((v, k) => {
            if (k === 'set-cookie') {
                result[k] = getSetCookieHeader(headers);
            } else {
                result[k] = v;
            }
        });
    }

    return result;
};

export const getHeader = (request: MakeRequestResult, header: string) => {
    const headers = _getHeaders(request);

    if (headers) {
        if (header === 'set-cookie') {
            return getSetCookieHeader(headers);
        }

        return headers.get(header);
    }
};

export const getStatus = (request: MakeRequestResult) => {
    return prop('status', _getResponse(request));
};

export const abort = (request: MakeRequestResult) => {
    const meta = request.getInternalMeta(PROTOCOL_HTTP);

    return meta && meta.requestAbort();
};
