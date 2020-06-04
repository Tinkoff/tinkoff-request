import prop from '@tinkoff/utils/object/prop';
import mapObj from '@tinkoff/utils/object/map';
import isArray from '@tinkoff/utils/is/array';
import isObject from '@tinkoff/utils/is/object';
import { Context, Plugin } from '@tinkoff/request-core';
import { LOG } from './constants/metaTypes';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        silent?: boolean;
        showQueryFields?: boolean | string[];
        showPayloadFields?: boolean | string[];
    }
}

const fillDuration = (context: Context) => {
    const meta = context.getExternalMeta(LOG);
    const end = Date.now();
    const duration = end - meta.start;

    context.updateExternalMeta(LOG, {
        end,
        duration,
    });
};

type LogFunction = (...args) => void;

interface Logger {
    debug: LogFunction;
    error: LogFunction;
}

const defaultLogger = (name: string): Logger => {
    return {
        debug: (...args) => console.debug(name, ...args), // tslint:disable-line:no-console
        error: (...args) => console.error(name, ...args), // tslint:disable-line:no-console
    };
};

const hideValues = (obj: any, showFields: Set<string> | boolean) => {
    if (showFields === true) {
        return obj;
    }

    if (!isObject(obj)) {
        return '*';
    }

    if (showFields === false) {
        return mapObj(() => '*', obj);
    }

    return mapObj((v, k) => (showFields.has(k) ? v : '*'), obj);
};

/**
 * Logs request events and timing
 *
 * requestParams:
 *      silent {boolean}
 *      showQueryFields {boolean | string[]} - whether the plugin should show request query values
 *      showPayloadFields {boolean | string[]} - whether the plugin should show request payload values
 *
 * metaInfo:
 *      log.start {number} - request start Date.now()
 *      log.end {number} - request end Date.now()
 *      log.duration {number} - request duration (end - start)
 *
 * @param name {string}
 * @param logger {Function} - logger factory
 * @param showQueryFields {boolean | string[]} - whether the plugin should show request query values
 * @param showPayloadFields {boolean | string[]} - whether the plugin should show request payload values
 * @return {{init: init, complete: complete, error: error}}
 */
export default ({
    name = '',
    logger = defaultLogger,
    showQueryFields: globalShowQueryFields = false,
    showPayloadFields: globalShowPayloadFields = false,
}: {
    name?: string;
    logger?: (name: string) => Logger;
    showQueryFields?: boolean | string[];
    showPayloadFields?: boolean | string[];
}): Plugin => {
    const log = logger(`request.${name}`);
    const getInfo = ({
        url,
        query,
        payload,
        showQueryFields,
        showPayloadFields,
    }: {
        url: string;
        query?: Record<string, string>;
        payload?: any;
        showQueryFields?: boolean | string[];
        showPayloadFields?: boolean | string[];
    }) => {
        const showQuery = showQueryFields ?? globalShowQueryFields;
        const showPayload = showPayloadFields ?? globalShowPayloadFields;

        return {
            url,
            query: query && hideValues(query, isArray(showQuery) ? new Set(showQuery) : showQuery),
            payload: payload && hideValues(payload, isArray(showPayload) ? new Set(showPayload) : showPayload),
        };
    };

    return {
        init: (context, next) => {
            const request = context.getRequest();
            const start = Date.now();
            const silent = prop('silent', request);

            if (!silent) {
                log.debug({
                    event: 'init',
                    info: getInfo(request),
                });
            }

            context.updateExternalMeta(LOG, {
                start,
            });

            next();
        },
        complete: (context, next) => {
            fillDuration(context);

            const request = context.getRequest();
            const silent = prop('silent', request);

            if (!silent) {
                log.debug({
                    event: 'complete',
                    info: getInfo(request),
                    meta: context.getExternalMeta(),
                });
            }

            next();
        },
        error: (context, next) => {
            const request = context.getRequest();
            const silent = prop('silent', request);

            fillDuration(context);
            if (!silent) {
                log.error({
                    event: 'error',
                    info: getInfo(request),
                    error: context.getState().error,
                    meta: context.getExternalMeta(),
                });
            }

            next();
        },
    };
};
