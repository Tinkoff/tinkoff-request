import nodeFetch from 'node-fetch';
import AbortController from 'abort-controller';

import noop from '@tinkoff/utils/function/noop';
import propOr from '@tinkoff/utils/object/propOr';
import { HttpMethods, Plugin, Status } from '@tinkoff/request-core';
import { Agent } from 'https';

import { addQuery, serialize, normalizeUrl } from './url';
import { PROTOCOL_HTTP, REQUEST_TYPES } from './constants';
import parse from './parse';
import createForm from './form';

const fetch = nodeFetch;
const isBrowser = typeof window !== 'undefined';
let isPageUnloaded = false;

if (isBrowser) {
    window.addEventListener('beforeunload', () => {
        isPageUnloaded = true;
    });
}

const getError = (err) => {
    return Object.assign(new Error(err.message), {
        stack: err.stack,
        status: err.status,
        text: err.text,
    });
};

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
            } else if (!noBody) {
                if (type === 'form') {
                    body = serialize(payload);
                } else {
                    body = JSON.stringify(payload);
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
                        abort();
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

            fetch(
                addQuery(normalizeUrl(url), {
                    ...(noBody ? payload : {}),
                    ...queryNoCache,
                    ...query,
                }),
                {
                    signal,
                    method,
                    headers: { 'Content-type': propOr(type, type, REQUEST_TYPES), ...formHeaders, ...headers },
                    agent: customAgent,
                    credentials: withCredentials ? 'include' : 'same-origin',
                    body,
                    timeout,
                }
            )
                .then((response: Response) => {
                    context.updateInternalMeta(PROTOCOL_HTTP, {
                        response,
                    });

                    if (response.ok) {
                        if (response[responseType]) {
                            return response[responseType]();
                        }

                        return parse(response);
                    } else {
                        return response
                            .text()
                            .catch(noop)
                            .then((text) => {
                                throw Object.assign(new Error(response.statusText), {
                                    text,
                                    status: response.status,
                                });
                            });
                    }
                })
                .then((response) => {
                    if (ended) {
                        return;
                    }

                    next({
                        status: Status.COMPLETE,
                        response: response,
                    });
                })
                .catch((err) => {
                    if (ended || (err && isPageUnloaded)) {
                        return;
                    }

                    next({
                        status: Status.ERROR,
                        error: getError(err),
                    });
                })
                .then(() => {
                    ended = true;
                    timer && clearTimeout(timer);
                });
        },
    };
};
