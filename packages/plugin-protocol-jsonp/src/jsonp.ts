import fetchJsonp from 'fetch-jsonp';

import type { Plugin } from '@tinkoff/request-core';
import { Status } from '@tinkoff/request-core';
import type { Query, QuerySerializer } from '@tinkoff/request-url-utils';
import { addQuery } from '@tinkoff/request-url-utils';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        url?: string;
        query?: Query;
        queryNoCache?: Query;
        jsonp?: fetchJsonp.Options;
    }
}

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
 * @param {object} jsonOptions configuration for `fetch-jsonp`
 * @param {QuerySerializer} querySerializer function that will be used instead of default value to serialize query strings in url
 * @return {{init: init}}
 */
export default (
    jsonpOptions: fetchJsonp.Options = {},
    {
        querySerializer,
    }: {
        querySerializer?: QuerySerializer;
    } = {}
): Plugin => {
    return {
        init: (context, next) => {
            const { url, query, queryNoCache, jsonp } = context.getRequest();
            let ended = false;

            fetchJsonp(
                addQuery(
                    url,
                    {
                        ...queryNoCache,
                        ...query,
                    },
                    querySerializer
                ),
                {
                    ...jsonpOptions,
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
