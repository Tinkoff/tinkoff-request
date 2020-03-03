import { Context } from '@tinkoff/request-core';
import { TIMER_DONE } from './constants/metaTypes';
import metrics from './metrics'

describe('plugins/metrics', () => {
    it('Returns empty object when metrics object not passed', () => {
        expect(metrics({ labelNames: [], getLabelsValuesFromContext: () => {} })).toEqual({});
    });

    describe('Set labels', () => {
        it('Pass labelNames to metrics fabrics', () => {
            const counterFabric = jest.fn();
            const histogramFabric = jest.fn();
            const labelNames = ['foo', 'bar', 'baz']

            metrics({
                metrics: { counter: counterFabric, histogram: histogramFabric },
                labelNames,
                getLabelsValuesFromContext: () => {}
            });

            counterFabric.mock.calls
                .forEach(([arg]) => expect(arg.labelNames).toBe(labelNames))
            histogramFabric.mock.calls
                .forEach(([arg]) => expect(arg.labelNames).toBe(labelNames))
        });

        ['complete', 'error'].forEach((method) => {
            it(`Pass labelValues from getLabelsValuesFromContext() to metrics instances, on ${method}`, () => {
                const counter = { inc: jest.fn() };
                const counterFabric = () => counter;
                const timerDone = jest.fn();
                const histogram = { startTimer: () => timerDone };
                const histogramFabric = () => histogram;
                const labelNames = [];
                const labelsValues = { foo: 'bar', baz: 'quux' };
                const getLabelsValuesFromContext = jest.fn(() => labelsValues);

                const plugin = metrics({
                    metrics: { counter: counterFabric, histogram: histogramFabric },
                    labelNames,
                    getLabelsValuesFromContext,
                });

                const context = new Context();
                plugin.init(context, () => {}, null);
                plugin[method](context, () => {}, null);

                expect(getLabelsValuesFromContext).toHaveBeenCalledTimes(1)
                counter.inc.mock.calls
                    .forEach(([arg]) => expect(arg).toBe(labelsValues))
                timerDone.mock.calls
                    .forEach(([arg]) => expect(arg).toBe(labelsValues))
            });
        });
    })

    describe('Lifecycle actions', () => {
        let context;
        let metricsStub;
        let counterInc;
        let timerDone;
        let startTimer;
        let next;

        beforeEach(() => {
            context = new Context();
            next = jest.fn()

            counterInc = jest.fn();
            timerDone = jest.fn();
            startTimer = jest.fn(() => timerDone);

            const counterFabric = () => ({ inc: counterInc });
            const histogramFabric = () => ({ startTimer });

            metricsStub = {
                counter: counterFabric,
                histogram: histogramFabric,
            }
        });

        it('Init', () => {
            const plugin = metrics({ metrics: metricsStub, labelNames: [], getLabelsValuesFromContext: () => {} });

            plugin.init(context, next, null);

            expect(startTimer).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledTimes(1)
            expect(context.getInternalMeta(TIMER_DONE)).toEqual({ timerDone })
        });

        it('Complete', () => {
            const plugin = metrics({ metrics: metricsStub, labelNames: [], getLabelsValuesFromContext: () => {} });

            plugin.init(context, () => {}, null);
            plugin.complete(context, next, null);

            expect(timerDone).toHaveBeenCalledTimes(1)
            expect(counterInc).toHaveBeenCalledTimes(1)
            expect(next).toHaveBeenCalledTimes(1)
        });

        it('Error', () => {
            const plugin = metrics({ metrics: metricsStub, labelNames: [], getLabelsValuesFromContext: () => {} });

            plugin.init(context, () => {}, null);
            plugin.error(context, next, null);

            expect(timerDone).toHaveBeenCalledTimes(1)
            expect(counterInc).toHaveBeenCalledTimes(2)
            expect(next).toHaveBeenCalledTimes(1)
        });
    });
});
