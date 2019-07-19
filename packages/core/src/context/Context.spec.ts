import Context from './Context';
import Status from '../constants/status';

describe('request/Context', () => {
    it('sets initial state', () => {
        expect(
            new Context({
                request: { a: 1, url: '' },
            }).getState()
        ).toEqual({
            request: { a: 1, url: '' },
            response: null,
            status: Status.INIT,
            error: null,
        });
    });

    it('setState updates state', () => {
        const context = new Context();

        expect(context.getState()).toEqual({
            status: Status.INIT,
            request: null,
            response: null,
            error: null,
        });

        context.setState({ status: Status.COMPLETE });
        expect(context.getState()).toEqual({
            status: Status.COMPLETE,
            request: null,
            response: null,
            error: null,
        });

        const error = new Error('pfpf');

        context.setState({ error, status: Status.ERROR });
        expect(context.getState()).toEqual({
            error,
            status: Status.ERROR,
            request: null,
            response: null,
        });
    });

    it('work with meta', () => {
        const context = new Context();
        const name = 'test';

        expect(context.getInternalMeta(name)).toBeUndefined();
        expect(context.getExternalMeta(name)).toBeUndefined();

        context.updateInternalMeta(name, { a: 1, b: 2 });
        expect(context.getInternalMeta(name)).toEqual({ a: 1, b: 2 });
        expect(context.getExternalMeta(name)).toBeUndefined();

        context.updateInternalMeta(name, { b: 3, c: 4 });
        expect(context.getInternalMeta(name)).toEqual({ a: 1, b: 3, c: 4 });
        expect(context.getExternalMeta(name)).toBeUndefined();

        context.updateExternalMeta(name, { b: 5, c: 6 });
        expect(context.getInternalMeta(name)).toEqual({ a: 1, b: 3, c: 4 });
        expect(context.getExternalMeta(name)).toEqual({ b: 5, c: 6 });
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
