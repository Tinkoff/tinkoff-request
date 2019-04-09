import Context from './Context';
import Status from '../constants/status';

describe('request/Context', () => {
    it('sets initial state', () => {
        expect(
            new Context({
                request: { a: 1, url: '' },
                meta: { b: 2 },
            }).getState()
        ).toEqual({
            request: { a: 1, url: '' },
            response: null,
            status: Status.INIT,
            meta: { b: 2 },
            error: null,
        });
    });

    it('setState updates state', () => {
        const context = new Context();

        expect(context.getState()).toEqual({
            status: Status.INIT,
            request: null,
            meta: {},
            response: null,
            error: null,
        });

        context.setState({ status: Status.COMPLETE, meta: { test: '123' } });
        expect(context.getState()).toEqual({
            status: Status.COMPLETE,
            request: null,
            meta: { test: '123' },
            response: null,
            error: null,
        });

        const error = new Error('pfpf');

        context.setState({ error, status: Status.ERROR, meta: { a: 1 } });
        expect(context.getState()).toEqual({
            error,
            status: Status.ERROR,
            request: null,
            meta: { a: 1 },
            response: null,
        });
    });

    it('work with meta', () => {
        const context = new Context();
        const name = 'test';

        expect(context.getMeta(name)).toBeUndefined();

        context.updateMeta(name, { a: 1, b: 2 });
        expect(context.getMeta(name)).toEqual({ a: 1, b: 2 });

        context.updateMeta(name, { b: 3, c: 4 });
        expect(context.getMeta(name)).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('get status', () => {
        const context = new Context({ status: Status.ERROR });

        expect(context.getStatus()).toBe(Status.ERROR);
    });

    it('get request', () => {
        const request = { a: 325, url: '' };
        const context = new Context({ request });

        expect(context.getRequest()).toBe(request);
    });

    it('get response', () => {
        const response = { b: 398 };
        const context = new Context({ response });

        expect(context.getResponse()).toBe(response);
    });
});
