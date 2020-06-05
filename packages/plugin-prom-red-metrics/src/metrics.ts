import { Plugin } from '@tinkoff/request-core';
import { TIMER_DONE } from './constants/metaTypes';

export default ({ metrics = null, prefix = '', labelNames, getLabelsValuesFromContext }): Plugin => {
    if (!metrics) return {};

    const addPrefix = (str) => (prefix ? `${prefix}_` : '') + str;

    const requestsCounter = metrics.counter({
        name: addPrefix('sent_requests_total'),
        help: 'Number of requests sent',
        labelNames,
    });
    const errorsCounter = metrics.counter({
        name: addPrefix('sent_requests_errors'),
        help: 'Number of requests that failed',
        labelNames,
    });
    const durationHistogram = metrics.histogram({
        name: addPrefix('sent_requests_execution_time'),
        help: 'Execution time of the sent requests',
        labelNames,
    });

    return {
        init: (context, next) => {
            context.updateInternalMeta(TIMER_DONE, {
                timerDone: durationHistogram.startTimer(),
            });
            next();
        },
        complete: (context, next) => {
            const labels = getLabelsValuesFromContext(context);

            requestsCounter.inc(labels);
            context.getInternalMeta(TIMER_DONE).timerDone(labels);
            next();
        },
        error: (context, next) => {
            const labels = getLabelsValuesFromContext(context);

            errorsCounter.inc(labels);
            requestsCounter.inc(labels);
            context.getInternalMeta(TIMER_DONE).timerDone(labels);
            next();
        },
    };
};
