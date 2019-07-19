import each from '@tinkoff/utils/array/each';
import { Context, Status } from '@tinkoff/request-core';
import circuitBreaker from './circuit-breaker';
import { CIRCUIT_BREAKER_META } from './constants';
import { CircuitBreaker } from './CircuitBreaker';

describe('plugins/circuit-breaker', () => {
    let currentTime = 1487077708000;
    let mockDate;
    const next = jest.fn();
    const makeRequest = jest.fn();
    let context;
    let plugin: ReturnType<typeof circuitBreaker>;

    const runFailure = (n: number, failure = true) => {
        each((v, i) => {
            plugin.init(context, next, makeRequest);
            context.setState({ error: new Error(`error ${i}`) });
            if (failure) {
                plugin.error(context, next, makeRequest);
            } else {
                plugin.complete(context, next, makeRequest);
            }
        }, Array(n));
    };

    beforeAll(() => {
        mockDate = jest.spyOn(Date, 'now').mockImplementation(() => currentTime);
    });

    afterAll(() => {
        mockDate.mockRestore();
    });

    beforeEach(() => {
        next.mockClear();

        context = new Context({ request: { url: 'test' } });
        plugin = circuitBreaker({
            failureThreshold: 5,
            failureTimeout: 100,
            openTimeout: 200,
            halfOpenThreshold: 3,
        });
    });

    it('should pass requests with no changes', () => {
        plugin.init(context, next, makeRequest);
        expect(next).toHaveBeenCalledWith();
        expect(context.getInternalMeta(CIRCUIT_BREAKER_META)).toMatchObject({
            breaker: expect.any(Object),
        });

        plugin.init(context, next, makeRequest);
        expect(next).toHaveBeenCalledWith();
    });

    it('should end requests with throw when `failureThreshold` is reached', () => {
        runFailure(6);

        plugin.init(context, next, makeRequest);
        expect(next).toHaveBeenCalledWith({
            status: Status.ERROR,
            error: new Error('error 5'),
        });
        expect(context.getExternalMeta(CIRCUIT_BREAKER_META)).toEqual({
            open: true,
        });
    });

    it('should allow `halfOpenThreshold` requests after `openTimeout`', () => {
        runFailure(6);
        currentTime += 300;

        next.mockClear();
        plugin.init(context, next, makeRequest);
        expect(next).toHaveBeenCalledWith();
        plugin.init(context, next, makeRequest);
        expect(next).toHaveBeenCalledWith();
        plugin.init(context, next, makeRequest);
        expect(next).toHaveBeenCalledWith();

        plugin.init(context, next, makeRequest);
        expect(next).toHaveBeenCalledWith({
            status: Status.ERROR,
            error: new Error('error 5'),
        });
        expect(context.getExternalMeta(CIRCUIT_BREAKER_META)).toEqual({
            open: true,
        });
    });

    it('should allow to make request after `openTimeout` and half-open requests are successful', () => {
        runFailure(6);
        currentTime += 300;

        runFailure(5, false);
        next.mockClear();

        runFailure(10, false);
        plugin.init(context, next, makeRequest);

        expect(next).toHaveBeenCalledWith();
        expect(context.getInternalMeta(CIRCUIT_BREAKER_META)).toEqual({
            breaker: expect.any(CircuitBreaker),
        });
    });

    it('should create different circuit breakers for different requests', () => {
        const getKey = jest.fn(({ request }) => request.url);
        plugin = circuitBreaker({
            getKey,
            failureThreshold: 1,
        });

        const context1 = new Context({ request: { url: 'test1' } });
        const context2 = new Context({ request: { url: 'test2' } });

        plugin.init(context1, next, makeRequest);
        plugin.init(context2, next, makeRequest);

        expect(getKey).toHaveBeenCalledWith({ ...context1.getState() });
        expect(getKey).toHaveBeenCalledWith({ ...context2.getState() });

        expect(context1.getInternalMeta(CIRCUIT_BREAKER_META).breaker).not.toBe(
            context2.getInternalMeta(CIRCUIT_BREAKER_META).breaker
        );
    });
});
