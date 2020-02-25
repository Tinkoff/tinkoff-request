import { Plugin } from '@tinkoff/request-core';
import { TIMER_DONE } from './constants/metaTypes';

export default ({
  metrics = null,
  labelNames,
  getLabelsValuesFromContext,
}): Plugin => {
  if (!metrics) return {};

  const requestsCounter = metrics.counter({
    name: 'sent_requests_total',
    help: 'Number of requests sent',
    labelNames,
  });
  const errorsCounter = metrics.counter({
    name: 'sent_requests_errors',
    help: 'Number of requests that failed',
    labelNames,
  });
  const durationHistogram = metrics.histogram({
    name: 'sent_requests_execution_time',
    help: 'Execution time of the sent requests',
    labelNames,
  });

  return {
    init: (context, next) => {
      if (!metrics) return;

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

      requestsCounter.inc(labels);
      errorsCounter.inc(labels);
      context.getInternalMeta(TIMER_DONE).timerDone(labels);
      next();
    },
  };
};
