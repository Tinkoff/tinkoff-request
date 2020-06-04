import { Context } from '@tinkoff/request-core';
import log from './log';
import { LOG } from './constants/metaTypes';

const mockDebug = jest.fn();
const mockError = jest.fn();

const logger = (name) => ({
    debug: mockDebug,
    error: mockError,
});

const next = jest.fn();
const realDateNow = Date.now;

Date.now = () => 32523523535;

describe('plugins/log', () => {
    let context: Context;

    beforeEach(() => {
        context = new Context();
        next.mockClear();
        mockDebug.mockClear();
    });

    afterAll(() => {
        Date.now = realDateNow;
    });

    describe('all fields are hidden by default', () => {
        const plugin = log({ logger, name: 'test' });

        it('init', () => {
            const url = 'test1';
            const query = { a: 1 };
            const payload = { b: 2 };
            const request = { query, payload, a: 1, url };

            context.setState({ request });
            plugin.init(context, next, null);

            expect(next).toHaveBeenCalled();
            expect(mockDebug).toHaveBeenLastCalledWith({
                event: 'init',
                info: { url, query: { a: '*' }, payload: { b: '*' } },
            });
            expect(context.getExternalMeta(LOG)).toEqual({
                start: Date.now(),
            });
        });

        it('complete', () => {
            const start = 1242152525;

            context.setState({ request: { url: 'test2', query: { a: 1 } } });
            context.updateExternalMeta(LOG, { start });
            plugin.complete(context, next, null);

            const meta = {
                log: { start, end: Date.now(), duration: Date.now() - start },
            };

            expect(next).toHaveBeenCalled();
            expect(mockDebug).toHaveBeenLastCalledWith({
                event: 'complete',
                info: { url: 'test2', query: { a: '*' } },
                meta,
            });
            expect(context.getExternalMeta(LOG)).toEqual({
                start,
                end: Date.now(),
                duration: Date.now() - start,
            });
        });

        it('error', () => {
            const start = 1242152525;
            const error = new Error('test');

            context.setState({ request: { url: 'test3', payload: { test: 'abc' } }, error });
            context.updateExternalMeta(LOG, { start });
            plugin.error(context, next, null);

            const meta = {
                start,
                end: Date.now(),
                duration: Date.now() - start,
            };

            expect(next).toHaveBeenCalled();
            expect(mockError).toHaveBeenCalledWith({
                event: 'error',
                info: { url: 'test3', payload: { test: '*' } },
                error,
                meta: { log: meta },
            });
            expect(context.getExternalMeta(LOG)).toEqual(meta);
        });
    });

    describe('hidden fields can be showed by request params', () => {
        const plugin = log({ logger, name: 'test', showPayloadFields: true });

        it('init', () => {
            const url = 'test1';
            const query = { a: 1 };
            const payload = { b: 2 };
            const request = { query, payload, a: 1, url };

            context.setState({ request });
            plugin.init(context, next, null);

            expect(next).toHaveBeenCalled();
            expect(mockDebug).toHaveBeenLastCalledWith({
                event: 'init',
                info: { url, query: { a: '*' }, payload: { b: 2 } },
            });
            expect(context.getExternalMeta(LOG)).toEqual({
                start: Date.now(),
            });
        });

        it('complete', () => {
            const start = 1242152525;

            context.setState({ request: { url: 'test2', query: { a: 1 }, showQueryFields: true } });
            context.updateExternalMeta(LOG, { start });
            plugin.complete(context, next, null);

            const meta = {
                log: { start, end: Date.now(), duration: Date.now() - start },
            };

            expect(next).toHaveBeenCalled();
            expect(mockDebug).toHaveBeenLastCalledWith({
                event: 'complete',
                info: { url: 'test2', query: { a: 1 } },
                meta,
            });
            expect(context.getExternalMeta(LOG)).toEqual({
                start,
                end: Date.now(),
                duration: Date.now() - start,
            });
        });

        it('error', () => {
            const start = 1242152525;
            const error = new Error('test');

            context.setState({ request: { url: 'test3', payload: { test: 'abc' }, showPayloadFields: false }, error });
            context.updateExternalMeta(LOG, { start });
            plugin.error(context, next, null);

            const meta = {
                start,
                end: Date.now(),
                duration: Date.now() - start,
            };

            expect(next).toHaveBeenCalled();
            expect(mockError).toHaveBeenCalledWith({
                event: 'error',
                info: { url: 'test3', payload: { test: '*' } },
                error,
                meta: { log: meta },
            });
            expect(context.getExternalMeta(LOG)).toEqual(meta);
        });
    });

    describe('specific hidden fields can be showed by request params', () => {
        const plugin = log({ logger, name: 'test', showQueryFields: ['a', 'c'] });

        it('init', () => {
            const url = 'test1';
            const query = { a: 1, b: 2, c: 3 };
            const payload = { test: 'abc' };
            const request = { query, payload, a: 1, url };

            context.setState({ request });
            plugin.init(context, next, null);

            expect(next).toHaveBeenCalled();
            expect(mockDebug).toHaveBeenLastCalledWith({
                event: 'init',
                info: { url, query: { a: 1, b: '*', c: 3 }, payload: { test: '*' } },
            });
            expect(context.getExternalMeta(LOG)).toEqual({
                start: Date.now(),
            });
        });

        it('complete', () => {
            const start = 1242152525;

            context.setState({
                request: {
                    url: 'test2',
                    query: { a: 1 },
                    payload: { a: 'a', b: 'b', c: 'c' },
                    showPayloadFields: ['a', 'c'],
                },
            });
            context.updateExternalMeta(LOG, { start });
            plugin.complete(context, next, null);

            const meta = {
                log: { start, end: Date.now(), duration: Date.now() - start },
            };

            expect(next).toHaveBeenCalled();
            expect(mockDebug).toHaveBeenLastCalledWith({
                event: 'complete',
                info: { url: 'test2', query: { a: 1 }, payload: { a: 'a', b: '*', c: 'c' } },
                meta,
            });
            expect(context.getExternalMeta(LOG)).toEqual({
                start,
                end: Date.now(),
                duration: Date.now() - start,
            });
        });

        it('error', () => {
            const start = 1242152525;
            const error = new Error('test');

            context.setState({
                request: {
                    url: 'test3',
                    query: { a: 1, b: 2, c: 3 },
                    payload: { a: 'a', b: 'b', c: 'c' },
                    showQueryFields: ['b'],
                },
                error,
            });
            context.updateExternalMeta(LOG, { start });
            plugin.error(context, next, null);

            const meta = {
                start,
                end: Date.now(),
                duration: Date.now() - start,
            };

            expect(next).toHaveBeenCalled();
            expect(mockError).toHaveBeenCalledWith({
                event: 'error',
                info: { url: 'test3', query: { a: '*', b: 2, c: '*' }, payload: { a: '*', b: '*', c: '*' } },
                error,
                meta: { log: meta },
            });
            expect(context.getExternalMeta(LOG)).toEqual(meta);
        });
    });

    describe('all fields are hidden by default', () => {
        const plugin = log({ logger, name: 'test' });

        it('init', () => {
            const url = 'test1';
            const query = { a: 1 };
            const payload = { b: 2 };
            const request = { query, payload, a: 1, url };

            context.setState({ request });
            plugin.init(context, next, null);

            expect(next).toHaveBeenCalled();
            expect(mockDebug).toHaveBeenLastCalledWith({
                event: 'init',
                info: { url, query: { a: '*' }, payload: { b: '*' } },
            });
            expect(context.getExternalMeta(LOG)).toEqual({
                start: Date.now(),
            });
        });

        it('complete', () => {
            const start = 1242152525;

            context.setState({ request: { url: 'test2', query: { a: 1 } } });
            context.updateExternalMeta(LOG, { start });
            plugin.complete(context, next, null);

            const meta = {
                log: { start, end: Date.now(), duration: Date.now() - start },
            };

            expect(next).toHaveBeenCalled();
            expect(mockDebug).toHaveBeenLastCalledWith({
                event: 'complete',
                info: { url: 'test2', query: { a: '*' } },
                meta,
            });
            expect(context.getExternalMeta(LOG)).toEqual({
                start,
                end: Date.now(),
                duration: Date.now() - start,
            });
        });

        it('error', () => {
            const start = 1242152525;
            const error = new Error('test');

            context.setState({ request: { url: 'test3', payload: { test: 'abc' } }, error });
            context.updateExternalMeta(LOG, { start });
            plugin.error(context, next, null);

            const meta = {
                start,
                end: Date.now(),
                duration: Date.now() - start,
            };

            expect(next).toHaveBeenCalled();
            expect(mockError).toHaveBeenCalledWith({
                event: 'error',
                info: { url: 'test3', payload: { test: '*' } },
                error,
                meta: { log: meta },
            });
            expect(context.getExternalMeta(LOG)).toEqual(meta);
        });
    });

    describe('show all fields', () => {
        const plugin = log({ logger, name: 'test', showQueryFields: true, showPayloadFields: true });

        it('init', () => {
            const url = 'test1';
            const query = { a: 1 };
            const payload = { b: 2 };
            const request = { query, payload, a: 1, url };

            context.setState({ request });
            plugin.init(context, next, null);

            expect(next).toHaveBeenCalled();
            expect(mockDebug).toHaveBeenLastCalledWith({ event: 'init', info: { url, query, payload } });
            expect(context.getExternalMeta(LOG)).toEqual({
                start: Date.now(),
            });
        });

        it('complete', () => {
            const start = 1242152525;

            context.setState({ request: { url: 'test2' } });
            context.updateExternalMeta(LOG, { start });
            plugin.complete(context, next, null);

            const meta = {
                log: { start, end: Date.now(), duration: Date.now() - start },
            };

            expect(next).toHaveBeenCalled();
            expect(mockDebug).toHaveBeenLastCalledWith({ event: 'complete', info: { url: 'test2' }, meta });
            expect(context.getExternalMeta(LOG)).toEqual({
                start,
                end: Date.now(),
                duration: Date.now() - start,
            });
        });

        it('error', () => {
            const start = 1242152525;
            const error = new Error('test');

            context.setState({ request: { url: 'test3' }, error });
            context.updateExternalMeta(LOG, { start });
            plugin.error(context, next, null);

            const meta = {
                start,
                end: Date.now(),
                duration: Date.now() - start,
            };

            expect(next).toHaveBeenCalled();
            expect(mockError).toHaveBeenCalledWith({
                event: 'error',
                info: { url: 'test3' },
                error,
                meta: { log: meta },
            });
            expect(context.getExternalMeta(LOG)).toEqual(meta);
        });
    });
});
