import { advanceTo, advanceBy } from 'jest-date-mock';
import { Context, Status } from '@tinkoff/request-core';
import retry from './retry';
import { RETRY_META } from './constants';

advanceTo(0);

const wait = async (times = 1) => {
    for (let i = 0; i < times; i++) {
        jest.runAllTimers();
        await Promise.resolve();
    }
};

describe('plugins/retry', () => {
    let context: Context;
    const next = jest.fn();
    const makeRequest = jest.fn();

    beforeEach(() => {
        context = new Context();
        next.mockClear();
        makeRequest.mockClear();
    });

    describe('retry option', () => {
        describe('plugin constructor', () => {
            it('should do nothing by default', () => {
                const plugin = retry();
                const url = 'test1';
                const request = { url };
                const error = new Error('test');

                plugin.init(context, next, makeRequest);
                context.setState({ request, error });
                plugin.error(context, next, makeRequest);

                expect(next).toHaveBeenCalledWith();
                expect(context.getExternalMeta(RETRY_META)).toBeUndefined();
            });

            it('should retry request if option is set', async () => {
                const plugin = retry({ retry: 1 });
                const url = 'test1';
                const request = { url };
                const response = { a: 1, b: 2 };
                const error = new Error('test');

                makeRequest.mockImplementation(() => Promise.resolve(response));
                plugin.init(context, next, makeRequest);
                advanceBy(10000);
                context.setState({ request, error });
                plugin.error(context, next, makeRequest);

                await wait();
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 50000 });
                expect(makeRequest).toHaveBeenCalledTimes(1);
                expect(next).toHaveBeenCalledWith({
                    status: Status.COMPLETE,
                    response,
                });
                expect(context.getExternalMeta(RETRY_META)).toEqual({
                    attempts: 1,
                });
            });

            it('should complete request after some retry succeeded', async () => {
                const plugin = retry({ retry: 3 });
                const url = 'test1';
                const request = { url };
                const response = { a: 1, b: 2 };
                const error = new Error('test');
                let attempt = 0;

                makeRequest.mockImplementation(() => {
                    advanceBy(10000);
                    return attempt++ > 1 ? Promise.resolve(response) : Promise.reject(error);
                });
                plugin.init(context, next, makeRequest);
                advanceBy(10000);
                context.setState({ request, error });
                plugin.error(context, next, makeRequest);

                await wait(3);
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 50000 });
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 40000 });
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 30000 });
                expect(makeRequest).toHaveBeenCalledTimes(3);
                expect(next).toHaveBeenCalledWith({
                    status: Status.COMPLETE,
                    response,
                });
                expect(context.getExternalMeta(RETRY_META)).toEqual({
                    attempts: 3,
                });
            });

            it('should do nothing if request failed after some attempts', async () => {
                const plugin = retry({ retry: 3 });
                const url = 'test1';
                const request = { url };
                const error = new Error('test');

                makeRequest.mockImplementation(() => {
                    advanceBy(5000);
                    return Promise.reject(error);
                });
                plugin.init(context, next, makeRequest);
                advanceBy(10000);
                context.setState({ request, error });
                plugin.error(context, next, makeRequest);

                await wait(3);
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 50000 });
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 45000 });
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 40000 });
                expect(makeRequest).toHaveBeenCalledTimes(3);
                expect(next).toHaveBeenCalledWith();
                expect(context.getExternalMeta(RETRY_META)).toEqual({
                    attempts: 3,
                    timeout: false,
                });
            });
        });

        describe('request params', () => {
            it('should use request params if set', async () => {
                const plugin = retry();
                const url = 'test1';
                const request = { url, retry: 3 };
                const response = { a: 1, b: 2 };
                const error = new Error('test');
                let attempt = 0;

                makeRequest.mockImplementation(() =>
                    attempt++ > 1 ? Promise.resolve(response) : Promise.reject(error)
                );
                plugin.init(context, next, makeRequest);
                advanceBy(10000);
                context.setState({ request, error });
                plugin.error(context, next, makeRequest);

                await wait(3);
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 50000 });
                expect(makeRequest).toHaveBeenCalledTimes(3);
                expect(next).toHaveBeenCalledWith({
                    status: Status.COMPLETE,
                    response,
                });
                expect(context.getExternalMeta(RETRY_META)).toEqual({
                    attempts: 3,
                });
            });

            it('should do nothing if request param set to 0', async () => {
                const plugin = retry({ retry: 3 });
                const url = 'test1';
                const request = { url, retry: 0 };
                const response = { a: 1, b: 2 };
                const error = new Error('test');

                makeRequest.mockImplementation(() => Promise.resolve(response));
                plugin.init(context, next, makeRequest);
                advanceBy(10000);
                context.setState({ request, error });
                plugin.error(context, next, makeRequest);

                expect(makeRequest).not.toHaveBeenCalled();
                expect(next).toHaveBeenCalledWith();
                expect(context.getExternalMeta(RETRY_META)).toBeUndefined();
            });
        });
    });

    describe('retryDelay option', () => {
        describe('plugin constructor', () => {
            it('should complete request after some retry succeeded', async () => {
                const retryDelay = jest.fn();
                const plugin = retry({ retry: 3, retryDelay });
                const url = 'test1';
                const request = { url };
                const response = { a: 1, b: 2 };
                const error = new Error('test');
                let attempt = 0;

                makeRequest.mockImplementation(() =>
                    attempt++ > 1 ? Promise.resolve(response) : Promise.reject(error)
                );
                plugin.init(context, next, makeRequest);
                context.setState({ request, error });
                plugin.error(context, next, makeRequest);

                await wait(3);
                expect(retryDelay).toHaveBeenCalledTimes(3);
                expect(retryDelay).toHaveBeenCalledWith(0);
                expect(retryDelay).toHaveBeenCalledWith(1);
                expect(retryDelay).toHaveBeenCalledWith(2);
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 60000 });
                expect(makeRequest).toHaveBeenCalledTimes(3);
                expect(next).toHaveBeenCalledWith({
                    status: Status.COMPLETE,
                    response,
                });
                expect(context.getExternalMeta(RETRY_META)).toEqual({
                    attempts: 3,
                });
            });
        });

        describe('request params', () => {
            it('should complete request after some retry succeeded', async () => {
                const retryDelay = jest.fn();
                const plugin = retry({ retry: 3, retryDelay: 100 });
                const url = 'test1';
                const request = { url, retryDelay };
                const response = { a: 1, b: 2 };
                const error = new Error('test');
                let attempt = 0;

                makeRequest.mockImplementation(() =>
                    attempt++ > 1 ? Promise.resolve(response) : Promise.reject(error)
                );
                plugin.init(context, next, makeRequest);
                advanceBy(10000);
                context.setState({ request, error });
                plugin.error(context, next, makeRequest);

                await wait(3);
                expect(retryDelay).toHaveBeenCalledTimes(3);
                expect(retryDelay).toHaveBeenCalledWith(0);
                expect(retryDelay).toHaveBeenCalledWith(1);
                expect(retryDelay).toHaveBeenCalledWith(2);
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 50000 });
                expect(makeRequest).toHaveBeenCalledTimes(3);
                expect(next).toHaveBeenCalledWith({
                    status: Status.COMPLETE,
                    response,
                });
                expect(context.getExternalMeta(RETRY_META)).toEqual({
                    attempts: 3,
                });
            });
        });
    });

    describe('timeout option', () => {
        describe('plugin constructor', () => {
            it('should set timeout based by maxTimeout option', async () => {
                const plugin = retry({ retry: 3, maxTimeout: 20000 });
                const url = 'test1';
                const request = { url };
                const error = new Error('test');

                makeRequest.mockImplementation(() => {
                    advanceBy(5000);
                    return Promise.reject(error);
                });
                plugin.init(context, next, makeRequest);
                advanceBy(10000);
                context.setState({ request, error });
                plugin.error(context, next, makeRequest);

                await wait(3);
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 10000 });
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 5000 });
                expect(makeRequest).toHaveBeenCalledTimes(2);
                expect(next).toHaveBeenCalledWith();
                expect(context.getExternalMeta(RETRY_META)).toEqual({
                    attempts: 2,
                    timeout: true,
                });
            });
        });

        describe('request params', () => {
            it('should set timeout based on timeout request option', async () => {
                const plugin = retry({ retry: 3 });
                const url = 'test1';
                const request = { url, timeout: 12000 };
                const error = new Error('test');

                makeRequest.mockImplementation(() => {
                    advanceBy(5000);
                    return Promise.reject(error);
                });
                plugin.init(context, next, makeRequest);
                advanceBy(10000);
                context.setState({ request, error });
                plugin.error(context, next, makeRequest);

                await wait(3);
                expect(makeRequest).toHaveBeenCalledWith({ url, retry: 0, silent: true, timeout: 2000 });
                expect(makeRequest).toHaveBeenCalledTimes(1);
                expect(next).toHaveBeenCalledWith();
                expect(context.getExternalMeta(RETRY_META)).toEqual({
                    attempts: 1,
                    timeout: true,
                });
            });
        });
    });
});
