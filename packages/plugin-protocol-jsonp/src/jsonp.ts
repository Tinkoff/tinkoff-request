import fetchJsonp from 'fetch-jsonp';

import { Plugin, Status } from '@tinkoff/request-core';

import { addQuery } from './url';

let isPageUnloaded = false;

window.addEventListener('beforeunload', () => {
    isPageUnloaded = true;
});

/**
 * Makes jsonp request.
 * Uses `fetch-jsonp` library.
 *
 * requestParams:
 *      url {string}
 *      query {object}
 *      queryNoCache {object} - query which wont be used in generating cache key
 *      jsonp {object} - configuration for `fetch-jsonp`
 *
 * @return {{init: init}}
 */
export default (options = {}): Plugin => {
    return {
        init: (context, next) => {
            const { url, query, queryNoCache, jsonp } = context.getRequest();
            let ended = false;

            fetchJsonp(
                addQuery(url, {
                    ...queryNoCache,
                    ...query,
                }),
                {
                    ...options,
                    ...jsonp,
                }
            )
                .then((res) => res.json())
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
                        error: err,
                    });
                })
                .then(() => {
                    ended = true;
                });
        },
    };
};
