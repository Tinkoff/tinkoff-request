import { Context, Status } from '@tinkoff/request-core';
import { VALIDATE } from './constants';
import validate from './validate';

const validator = ({ response }) => {
    if (response.error) {
        return new Error(response.error);
    }
};

const errorValidator = ({ error }) => {
    return !!error.valid;
};

const plugin = validate({ validator, errorValidator });
const context = new Context();

context.setState = jest.fn(context.setState.bind(context));
context.updateMeta = jest.fn(context.updateMeta.bind(context));

describe('plugins/validate/validate', () => {
    beforeEach(() => {
        // @ts-ignore
        context.setState.mockClear();
        // @ts-ignore
        context.updateMeta.mockClear();
    });

    it('if validator returns undefined plugin should not return any state or call next callback', () => {
        context.setState({ response: { a: 1 } });
        (context.setState as jest.Mock).mockClear();
        const next = jest.fn();

        expect(plugin.complete(context, next, null)).toBeUndefined();
        expect(context.setState).not.toHaveBeenCalled();
        expect(context.updateMeta).toHaveBeenCalledWith(VALIDATE, { validated: true });
        expect(next).toHaveBeenCalledWith();
    });

    it('on error validate, change status to error', () => {
        const request = { a: 1, url: '' };
        const next = jest.fn();

        context.setState({ request, response: { error: '123' } });

        plugin.complete(context, next, null);
        expect(next).toHaveBeenCalledWith({
            request,
            status: Status.ERROR,
            error: new Error('123')
        });
    });

    it('on error validate, change status to error, fallback disabled', () => {
        const request = { a: 1, url: '' };
        const next = jest.fn();
        const plugin = validate({ validator, allowFallback: false });

        context.setState({ request, response: { error: '123' } });

        plugin.complete(context, next, null);
        expect(next).toHaveBeenCalledWith({
            request: { ...request, fallbackCache: false },
            status: Status.ERROR,
            error: new Error('123')
        });
    });

    it('on errored request, errorValidator may change request to complete', () => {
        const response = { test: 'abc' };
        const error = Object.assign(new Error(), { valid: true });
        const next = jest.fn();

        context.setState({ error, response });

        plugin.error(context, next, null);
        expect(next).toHaveBeenCalledWith({
            status: Status.COMPLETE,
            error: null,
        });
        expect(context.updateMeta).toHaveBeenCalledWith(VALIDATE, {
            errorValidated: true,
        });
        expect(context.updateMeta).toHaveBeenCalledWith(VALIDATE, {
            error,
        });
    });
});
