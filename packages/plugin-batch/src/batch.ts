import each from '@tinkoff/utils/array/each';
import prop from '@tinkoff/utils/object/prop';
import propOr from '@tinkoff/utils/object/propOr';
import type { Plugin, Request, Next } from '@tinkoff/request-core';
import { Status } from '@tinkoff/request-core';
import { BATCH } from './constants/metaTypes';

const DEFAULT_BATCH_TIMEOUT = 100;

interface BatchRequest {
    requests: Request[];
    nexts: Next[];
}

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        batchKey?: string;
        batchTimeout?: number;
    }
}

/**
 * Batch multiple requests into a single request
 *
 * requestParams:
 *      batchKey {string}
 *      batchTimeout {number}
 *
 * metaInfo:
 *     batched {boolean} - shows that current request was batched
 *
 * @param {number} [timeout = 100] - time after which plugin will initiate a grouped request
 * @param {function} makeGroupedRequest - function accepts an array of requests and returns promise
 *          which should be resolved with an array of responses
 *  @param {boolean} shouldExecute - enable plugin
 * @return {{shouldExecute: function(*): *, init: init}}
 */
export default ({ timeout = DEFAULT_BATCH_TIMEOUT, shouldExecute = true, makeGroupedRequest }): Plugin => {
    const batchRequests: Record<string, BatchRequest> = {};

    return {
        shouldExecute: (context) => {
            return makeGroupedRequest && shouldExecute && prop('batchKey', context.getRequest());
        },
        init: (context, next) => {
            const request = context.getRequest();
            const batchKey: string = prop('batchKey', request);
            const batchTimeout = propOr('batchTimeout', timeout, request);

            context.updateExternalMeta(BATCH, {
                batched: true,
            });

            const running = batchRequests[batchKey];

            if (running) {
                running.requests.push(request);
                running.nexts.push(next);
                return;
            }

            batchRequests[batchKey] = { requests: [request], nexts: [next] };

            setTimeout(() => {
                const { requests, nexts } = batchRequests[batchKey];

                delete batchRequests[batchKey];

                makeGroupedRequest(requests)
                    .then(
                        each((response, i) => {
                            nexts[i]({
                                response,
                                status: Status.COMPLETE,
                            });
                        })
                    )
                    .catch((error) => {
                        const state = { error, status: Status.ERROR };

                        each((nxt) => nxt(state), nexts);
                    });
            }, batchTimeout);
        },
    };
};
