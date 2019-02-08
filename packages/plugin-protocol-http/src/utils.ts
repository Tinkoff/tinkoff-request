import { MakeRequestResult } from '@tinkoff/request-core';
import prop from '@tinkoff/utils/object/prop';
import { Request, Response } from 'superagent';
import { PROTOCOL_HTTP } from './constants';

// TODO: when some plugins (for example cache) break flow, plugin-http won't be called and meta will be empty
export const _getRequest = (request: MakeRequestResult): Request | void => {
    const meta = request.getMeta(PROTOCOL_HTTP);

    return meta && meta.request;
};

export const _getResponse = (request: MakeRequestResult): Response | void => {
    const meta = request.getMeta(PROTOCOL_HTTP);

    return meta && meta.response;
};

export const getHeaders = (request: MakeRequestResult) => {
    return prop('header', _getResponse(request));
};

export const getHeader = (request: MakeRequestResult, header: string) => {
    const res = _getResponse(request);

    return res && res.get(header);
};

export const getText = (request: MakeRequestResult) => {
    return prop('text', _getResponse(request));
};

export const getStatus = (request: MakeRequestResult) => {
    return prop('status', _getResponse(request));
};

export const abort = (request: MakeRequestResult) => {
    const req = _getRequest(request);

    return req && req.abort();
};
