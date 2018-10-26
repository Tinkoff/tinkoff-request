import prop from '@tinkoff/utils/object/prop';
import { Context, Plugin } from '@tinkoff/request-core';
import { LOG } from './constants/metaTypes';

const fillDuration = (context: Context) => {
    const meta = context.getMeta(LOG);
    const end = Date.now();
    const duration = end - meta.start;

    context.updateMeta(LOG, {
        end,
        duration
    });
};

type LogFunction = (...args) => void;

interface Logger {
    info: LogFunction;
    debug: LogFunction;
    error: LogFunction;
}

const defaultLogger = (name: string) : Logger => {
    return {
        info: (...args) => console.info(name, ...args), // tslint:disable-line:no-console
        debug: (...args) => console.debug(name, ...args), // tslint:disable-line:no-console
        error: (...args) => console.error(name, ...args), // tslint:disable-line:no-console
    };
};

/**
 * Logs request events and timing
 *
 * requestParams:
 *      silent {boolean}
 *
 * metaInfo:
 *      log.start {number} - request start Date.now()
 *      log.end {number} - request end Date.now()
 *      log.duration {number} - request duration (end - start)
 *
 * @param name {string}
 * @param logger {Function} - logger factory
 * @return {{init: init, complete: complete, error: error}}
 */
export default ({
    name = '',
    logger = defaultLogger
}) : Plugin => {
    const log = logger(`request.${name}`);

    return {
        init: (context, next) => {
            const request = context.getRequest();
            const start = Date.now();
            const silent = prop('silent', request);

            if (!silent) {
                log.info('init', request.url, request.query, request.payload);
            }

            log.debug('init', request);

            context.updateMeta(LOG, {
                start
            });

            next();
        },
        complete: (context, next) => {
            fillDuration(context);

            const state = context.getState();
            const request = context.getRequest();
            const silent = prop('silent', request);

            if (!silent) {
                log.info('complete', request.url, state.meta);
            }

            log.debug('complete', state);

            next();
        },
        error: (context, next) => {
            const request = context.getRequest();
            const silent = prop('silent', request);

            fillDuration(context);
            if (!silent) {
                log.error('error', request.url, context.getState());
            }
            log.debug('error', context.getState());

            next();
        }
    };
};
