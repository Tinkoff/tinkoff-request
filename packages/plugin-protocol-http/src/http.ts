import { Agent } from 'https';
import AbortController from 'abort-controller';

import propOr from '@tinkoff/utils/object/propOr';
import { Plugin, Status } from '@tinkoff/request-core';
import { Query, QuerySerializer } from '@tinkoff/request-url-utils';
import { addQuery, normalizeUrl } from '@tinkoff/request-url-utils';

import { fetch } from './fetch';
import { serialize } from './serialize';
import { PROTOCOL_HTTP, REQUEST_TYPES, HttpMethods } from './constants';
import parse from './parse';
import createForm from './form';
import { TimeoutError, AbortError, HttpRequestError } from './errors';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        httpMethod?:
            | keyof typeof HttpMethods
            | typeof HttpMethods[keyof typeof HttpMethods]
            | 'get'
            | 'post'
            | 'put'
            | 'delete'
            | 'head'
            | 'patch';
        url?: string;
        query?: Query;
        queryNoCache?: Query;
        headers?: object;
        type?: string;
        payload?: any;
        attaches?: any[];
        timeout?: number;
        withCredentials?: boolean;
        abortPromise?: Promise<any>;
        signal?: AbortSignal;
    }

    export interface RequestErrorCode {
        ERR_HTTP_REQUEST_TIMEOUT: 'ERR_HTTP_REQUEST_TIMEOUT';

        ERR_HTTP_ERROR: 'ERR_HTTP_ERROR';

        ABORT_ERR: 'ABORT_ERR';
    }
}

const isBrowser = typeof window !== 'undefined';

/**
 * Makes http/https request.
 * Uses `node-fetch` library.
 *
 * requestParams:
 *      httpMethod {string} [='get']
 *      url {string}
 *      query {object}
 *      queryNoCache {object} - query which wont be used in generating cache key
 *      headers {object}
 *      type {string} [='form']
 *      payload {object}
 *      attaches {array}
 *      timeout {number}
 *      withCredentials {boolean}
 *      abortPromise {Promise}
 *      signal {AbortSignal}
 *
 * @param {agent} [agent = Agent] set custom http in node js. The browser ignores this parameter.
 * @param {QuerySerializer} querySerializer function that will be used instead of default value to serialize query strings in url
 * @return {{init: init}}
 */
export default ({
    agent,
    querySerializer,
}: {
    agent?: { http: Agent; https: Agent };
    querySerializer?: QuerySerializer;
} = {}): Plugin => {
    let customAgent;

    if (!isBrowser && agent) {
        customAgent = (parsedUrl) => {
            if (parsedUrl.protocol === 'http:') {
                return agent.http;
            }

            return agent.https;
        };
    }

    return {
        init: (context, next) => {
            const {
                httpMethod = HttpMethods.GET,
                url,
                query,
                queryNoCache,
                headers,
                type = 'form',
                payload,
                attaches = [],
                timeout,
                withCredentials,
                abortPromise,
                responseType,
                signal: argSignal,
            } = context.getRequest();

            let ended = false;
            // should be uppercased by spec
            // https://fetch.spec.whatwg.org/#concept-method-normalize
            const method = httpMethod.toUpperCase();
            const noBody = method === HttpMethods.GET || method === HttpMethods.HEAD;

            let body;
            let formHeaders;

            if (attaches.length) {
                body = createForm(payload, isBrowser ? attaches : []);

                formHeaders = body.getHeaders && body.getHeaders();
            } else {
                const contentType = propOr(type, type, REQUEST_TYPES);
                formHeaders = contentType ? { 'Content-type': contentType } : {};

                if (!noBody) {
                    body = serialize(type, payload, querySerializer);
                }
            }

            let timer;
            let signal;

            if (AbortController) {
                const controller = new AbortController();
                signal = controller.signal;

                const abort = (abortOptions?) => {
                    if (ended) {
                        return;
                    }

                    ended = true;
                    controller.abort();

                    next({
                        status: Status.ERROR,
                        error:
                            abortOptions instanceof Error
                                ? abortOptions
                                : Object.assign(new AbortError(), {
                                      abortOptions: abortOptions || {},
                                  }),
                    });
                };

                if (abortPromise) {
                    abortPromise.then(abort);
                }

                if (timeout) {
                    timer = setTimeout(() => {
                        abort(new TimeoutError());
                    }, timeout);
                }

                context.updateInternalMeta(PROTOCOL_HTTP, {
                    requestAbort: abort,
                });

                if (argSignal) {
                    if (argSignal.aborted) {
                        abort();
                    } else {
                        argSignal.addEventListener('abort', () => {
                            abort();
                        });
                    }
                }
            } else {
                if (timeout) {
                    timer = setTimeout(() => {
                        next({
                            status: Status.ERROR,
                            error: new TimeoutError(),
                        });

                        ended = true;
                    }, timeout);
                }
            }

            let response: Response;
            let responseBody;

            fetch(
                addQuery(
                    normalizeUrl(url),
                    {
                        ...(noBody ? payload : {}),
                        ...queryNoCache,
                        ...query,
                    },
                    querySerializer
                ),
                {
                    signal,
                    method,
                    headers: { ...formHeaders, ...headers },
                    agent: customAgent,
                    credentials: withCredentials ? 'include' : 'same-origin',
                    body,
                    timeout,
                }
            )
                .then((resp: Response) => {
                    response = resp;

                    context.updateInternalMeta(PROTOCOL_HTTP, {
                        response,
                    });

                    if (response[responseType]) {
                        return response[responseType]();
                    }

                    return parse(response);
                })
                .then((body) => {
                    if (ended) {
                        return;
                    }

                    responseBody = body;

                    if (!response.ok) {
                        throw new Error(response.statusText);
                    }

                    next({
                        status: Status.COMPLETE,
                        response: responseBody,
                    });
                })
                .catch((err) => {
                    if (ended) {
                        return;
                    }

                    if (err && typeof err.type === 'string' && /timeout/.test(err.type)) {
                        return next({
                            status: Status.ERROR,
                            error: new TimeoutError(),
                        });
                    }

                    next({
                        status: Status.ERROR,
                        error: Object.assign(err, {
                            code: 'ERR_HTTP_ERROR',
                            status: response && response.status,
                            body: responseBody,
                        }) as HttpRequestError,
                        response: responseBody,
                    });
                })
                .then(() => {
                    ended = true;
                    timer && clearTimeout(timer);
                });
        },
    };
};
