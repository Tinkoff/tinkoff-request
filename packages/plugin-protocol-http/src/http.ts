import AbortController from 'abort-controller';

import propOr from '@tinkoff/utils/object/propOr';
import { Plugin, Status } from '@tinkoff/request-core';
import { Agent } from 'https';

import { fetch } from './fetch';
import { addQuery, normalizeUrl } from './url';
import { serialize } from './serialize';
import { PROTOCOL_HTTP, REQUEST_TYPES, HttpMethods } from './constants';
import parse from './parse';
import createForm from './form';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        httpMethod?: keyof typeof HttpMethods | typeof HttpMethods[keyof typeof HttpMethods];
        url?: string;
        query?: Record<string, string>;
        queryNoCache?: Record<string, string>;
        headers?: object;
        type?: string;
        payload?: any;
        attaches?: any[];
        timeout?: number;
        withCredentials?: boolean;
        abortPromise?: Promise<any>;
    }
}

const isBrowser = typeof window !== 'undefined';
let isPageUnloaded = false;

if (isBrowser) {
    window.addEventListener('beforeunload', () => {
        isPageUnloaded = true;
    });
}

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
 *
 * @param {agent} [agent = Agent] set custom http in node js. The browser ignores this parameter.
 * @return {{init: init}}
 */
export default ({ agent }: { agent?: { http: Agent; https: Agent } } = {}): Plugin => {
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
            } = context.getRequest();

            let ended = false;
            const method = httpMethod.toLowerCase();
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
                    body = serialize(type, payload);
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
                        error: abortOptions || {},
                    });
                };

                if (abortPromise) {
                    abortPromise.then(abort);
                }

                if (isBrowser && timeout) {
                    // node-fetch has timeout option, so add check only for browser
                    timer = setTimeout(() => {
                        abort(new Error('Request timed out'));
                    }, timeout);
                }

                context.updateInternalMeta(PROTOCOL_HTTP, {
                    requestAbort: abort,
                });
            } else {
                if (isBrowser && timeout) {
                    // node-fetch has timeout option, so add check only for browser
                    timer = setTimeout(() => {
                        next({
                            status: Status.ERROR,
                            error: new Error('Request timed out'),
                        });

                        ended = true;
                    }, timeout);
                }
            }

            let response: Response;
            let responseBody;

            fetch(
                addQuery(normalizeUrl(url), {
                    ...(noBody ? payload : {}),
                    ...queryNoCache,
                    ...query,
                }),
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
                    if (ended || (err && isPageUnloaded)) {
                        return;
                    }

                    next({
                        status: Status.ERROR,
                        error: Object.assign(err, {
                            status: response && response.status,
                            body: responseBody,
                        }),
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
