import { Context } from '@tinkoff/request-core';
import log from './log';

const mockDebug = jest.fn();
const mockInfo = jest.fn();
const mockError = jest.fn();

const logger = (name) => ({
    debug: mockDebug,
    info: mockInfo,
    error: mockError,
});

const plugin = log({ logger, name: 'test' });
const next = jest.fn();
const realDateNow = Date.now;

Date.now = () => 32523523535;

describe('plugins/log', () => {
    let context;

    beforeEach(() => {
        context = new Context();
        next.mockClear();
        mockDebug.mockClear();
    });

    afterAll(() => {
        Date.now = realDateNow;
    });

    it('init', () => {
        const query = { a: 1 };
        const payload = { b: 2 };
        const request = { query, payload, a: 1, url: 'test1' };

        context.setState({ request });
        plugin.init(context, next, null);

        expect(next).toHaveBeenCalled();
        expect(mockInfo).toHaveBeenLastCalledWith('init', 'test1', query, payload);
        expect(mockDebug).toHaveBeenCalledWith('init', request);
        expect(context.getState().meta).toEqual({
            log: {
                start: Date.now(),
            },
        });
    });

    it('complete', () => {
        const start = 1242152525;

        context.setState({ request: { url: 'test2' }, meta: { log: { start } } });
        plugin.complete(context, next, null);

        expect(next).toHaveBeenCalled();
        expect(mockInfo).toHaveBeenLastCalledWith('complete', 'test2', {
            log: { start, end: Date.now(), duration: Date.now() - start },
        });
        expect(mockDebug).toHaveBeenCalledWith('complete', context.getState());
        expect(context.getState().meta).toEqual({
            log: {
                start,
                end: Date.now(),
                duration: Date.now() - start,
            },
        });
    });

    it('error', () => {
        const start = 1242152525;

        context.setState({ request: { url: 'test3' }, meta: { log: { start } } });
        plugin.error(context, next, null);

        expect(next).toHaveBeenCalled();
        expect(mockError).toHaveBeenCalledWith('error', 'test3', context.getState());
        expect(context.getState().meta).toEqual({
            log: {
                start,
                end: Date.now(),
                duration: Date.now() - start,
            },
        });
    });
});
