import { Context } from '@tinkoff/request-core';
import metrics from './httpMetrics';

describe('plugins/metrics/httpMetrics', () => {
    it('Pass http labelNames to metrics fabrics', () => {
        const counterFabric = jest.fn();
        const histogramFabric = jest.fn();
        const labelNames = ['method', 'url', 'status'];

        metrics({
            metrics: { counter: counterFabric, histogram: histogramFabric },
        });

        counterFabric.mock.calls.forEach(([arg]) => expect(arg.labelNames).toEqual(labelNames));
        histogramFabric.mock.calls.forEach(([arg]) => expect(arg.labelNames).toEqual(labelNames));
    });

    it('Get http labels values from context', () => {
        const counter = { inc: jest.fn() };
        const counterFabric = jest.fn(() => counter);
        const timerDone = jest.fn();
        const histogram = { startTimer: () => timerDone };
        const histogramFabric = jest.fn(() => histogram);

        const plugin = metrics({
            metrics: { counter: counterFabric, histogram: histogramFabric },
        });

        const context = new Context();
        context.setState({
            request: {
                url: 'foo',
                httpMethod: 'POST',
            },
        });
        context.updateInternalMeta('PROTOCOL_HTTP', {
            response: {
                status: '200',
            },
        });
        plugin.init(context, () => {}, null);
        plugin.complete(context, () => {}, null);

        const labelsValues = {
            url: 'foo',
            method: 'POST',
            status: '200',
        };

        counter.inc.mock.calls.forEach(([arg]) => expect(arg).toEqual(labelsValues));
        timerDone.mock.calls.forEach(([arg]) => expect(arg).toEqual(labelsValues));
    });

    it('Return default http labels values', () => {
        const counter = { inc: jest.fn() };
        const counterFabric = jest.fn(() => counter);
        const timerDone = jest.fn();
        const histogram = { startTimer: () => timerDone };
        const histogramFabric = jest.fn(() => histogram);

        const plugin = metrics({
            metrics: { counter: counterFabric, histogram: histogramFabric },
        });

        const context = new Context();
        plugin.init(context, () => {}, null);
        plugin.complete(context, () => {}, null);

        const labelsValues = {
            url: 'unknown',
            status: 'unknown',
            method: 'GET',
        };

        counter.inc.mock.calls.forEach(([arg]) => expect(arg).toEqual(labelsValues));
        timerDone.mock.calls.forEach(([arg]) => expect(arg).toEqual(labelsValues));
    });
});
