import request from 'superagent';
import requestJSONP from 'superagent-jsonp';
import keys from '@tinkoff/utils/object/keys';
import { Status, Plugin, HttpMethods } from '@tinkoff/request-core';
import { PROTOCOL_HTTP } from './constants';
import { Agent } from 'https';

const isBrowser = typeof window !== 'undefined';
let isPageUnloaded = false;

if (isBrowser) {
    window.addEventListener('beforeunload', () => {
        isPageUnloaded = true;
    });
}

// TODO Remove then resolving https://github.com/visionmedia/superagent/issues/1496
export const getProtocol = (url: string) => (new URL(url).protocol.indexOf('https') === 0 ? 'https' : 'http');

/**
 * Makes http/https request.
 * Uses `superagent` library.
 *
 * requestParams:
 *      httpMethod {string} [='get']
 *      url {string}
 *      query {object}
 *      queryNoCache {object} - query which wont be used in generating cache key
 *      rawQueryString {string}
 *      headers {object}
 *      type {string} [='form']
 *      payload {object}
 *      attaches {array}
 *      jsonp {boolean | object}
 *      timeout {number}
 *      withCredentials {boolean}
 *      onProgress {function}
 *      abortPromise {Promise}
 *
 * @param {agent} [agent = Agent] set custom http in node js. The browser ignores this parameter.
 * @return {{init: init}}
 */
export default ({ agent }: { agent?: { http: Agent; https: Agent } } = {}): Plugin => {
    const customAgent = isBrowser ? undefined : agent;

    return {
        init: (context, next) => {
            const {
                httpMethod = HttpMethods.GET,
                url,
                query,
                queryNoCache,
                rawQueryString,
                headers,
                type = 'form',
                payload,
                attaches = [],
                jsonp,
                timeout,
                withCredentials,
                onProgress,
                resolveOnAbort = true,
                abortPromise,
                responseType,
            } = context.getRequest();

            const method = httpMethod.toLowerCase();
            const req: request.SuperAgentRequest = request[method](url);

            if (headers) {
                Object.keys(headers).forEach((key) => req.set(key, headers[key]));
            }

            if (attaches.length) {
                keys(payload).forEach((key) => req.field(key, payload[key]));
            } else {
                req[method === 'get' ? 'query' : 'send'](payload);

                if (type !== 'multipart/form-data') {
                    req.type(type);
                }
            }

            if (responseType) {
                req.responseType(responseType);
            }

            req.query(Object.assign({}, queryNoCache, query))
                // to be able to process requests with different array formats https://github.com/visionmedia/superagent/issues/629
                .query(rawQueryString)
                .timeout({
                    response: timeout,
                    deadline: timeout * 1.5,
                });

            if (withCredentials) {
                req.withCredentials();
            }

            // Set custom agent
            if (customAgent) {
                req.agent(customAgent[getProtocol(url)]);
            }

            if (jsonp) {
                req.use(typeof jsonp === 'object' ? requestJSONP(jsonp) : requestJSONP());
            }

            if (onProgress) {
                req.on('progress', onProgress);
            }

            attaches.forEach((file) => {
                if (!isBrowser || !(file instanceof window.Blob)) {
                    return;
                }

                const fileUploadName = (file as any).uploadName || (file as any).name;
                const fileFieldName = (file as any).fieldName || 'file';

                req.attach(fileFieldName, file, encodeURIComponent(fileUploadName));
            });

            if (abortPromise) {
                abortPromise.then((abortOptions) => {
                    req.abort();
                    if (resolveOnAbort || abortOptions) {
                        next({
                            status: Status.ERROR,
                            response: abortOptions || {},
                        });
                    }
                });
            }

            req.end((err, response) => {
                if (err && isPageUnloaded) {
                    return;
                }

                context.updateMeta(PROTOCOL_HTTP, {
                    response,
                });

                if (err) {
                    next({
                        status: Status.ERROR,
                        response: response && response.body,
                        error: err,
                    });
                } else {
                    next({
                        status: Status.COMPLETE,
                        response: response && response.body,
                    });
                }
            });

            context.updateMeta(PROTOCOL_HTTP, {
                request: req,
            });
        },
    };
};
