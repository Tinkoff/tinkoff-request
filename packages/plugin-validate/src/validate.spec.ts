import { Context, Status } from '@tinkoff/request-core';
import validate from './validate';

const validator = ({ response }) => {
    if (response.error) {
        return new Error(response.error);
    }
};
const plugin = validate({ validator });
const context = new Context();

context.setState = jest.fn(context.setState.bind(context));

describe('plugins/validate/validate', () => {
    it('if validator returns undefined plugin should not return any state or call next callback', () => {
        context.setState({ response: { a: 1 } });
        (context.setState as jest.Mock).mockClear();
        const next = jest.fn();

        expect(plugin.complete(context, next, null)).toBeUndefined();
        expect(context.setState).not.toHaveBeenCalled();
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
});
