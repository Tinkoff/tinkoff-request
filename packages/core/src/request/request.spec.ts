import request from './request';
import Context from '../context/Context';
import Status from '../constants/status';

const createPlugin = () => ({
    shouldExecute: jest.fn(() => true),
    init: jest.fn((_, next) => next()),
    complete: jest.fn((_, next) => next()),
    error: jest.fn((_, next) => next()),
});

describe('request', () => {
    jest.useRealTimers();

    it('should return promise with additional methods', () => {
        const plugin = createPlugin();
        const req = request([plugin]);
        const params = { a: 1, b: 2 };
        const res = req({ url: 'init', params });

        expect(res).toBeInstanceOf(Promise);
        expect(res).toMatchObject({
            getInternalMeta: expect.any(Function),
            getExternalMeta: expect.any(Function),
            getState: expect.any(Function),
        });

        expect(res.getState()).toEqual({
            request: {
                url: 'init',
                params,
            },
            error: null,
            response: null,
            status: 'complete',
        });
    });

    it('should not call plugin function if shouldExecute returns false', () => {
        const plugin = createPlugin();
        const req = request([plugin]);

        plugin.shouldExecute.mockImplementation(() => false);

        req({ url: '' });
        expect(plugin.shouldExecute).toHaveBeenCalledWith(expect.any(Context));
        expect(plugin.init).not.toHaveBeenCalled();

        plugin.shouldExecute.mockImplementation(() => true);
        req({ url: '' });
        expect(plugin.init).toHaveBeenCalledWith(expect.any(Context), expect.any(Function), expect.any(Function));
    });

    it('if no handler just ignore it', () => {
        const plugin = {};
        const req = request([plugin]);

        return req({ url: '' })
            .catch(() => {
                expect(true).toBe(false);
            })
            .then(() => {
                expect(true).toBe(true);
            });
    });

    it('if plugin expects next callback then stop request flow, until it calls', () => {
        const plugin1 = createPlugin();
        const plugin2 = createPlugin();
        const req = request([plugin1, plugin2]);
        let next;

        plugin1.init = jest.fn((_, nxt) => {
            next = nxt;
        });
        plugin2.init = jest.fn((_, nxt) => {
            nxt();
        });

        req({ url: '' });
        expect(plugin1.init).toHaveBeenCalledWith(expect.any(Context), expect.any(Function), expect.any(Function));
        expect(plugin2.init).not.toHaveBeenCalled();

        next();
        expect(plugin1.init).toHaveBeenCalledTimes(1);
        expect(plugin2.init).toHaveBeenCalledWith(expect.any(Context), expect.any(Function), expect.any(Function));
    });

    it('if some plugin change status do not call other plugins', () => {
        const plugin1 = createPlugin();
        const plugin2 = createPlugin();
        const plugin3 = createPlugin();
        const plugin4 = createPlugin();
        const req = request([plugin1, plugin2, plugin3, plugin4]);
        const response = { a: 1 };

        plugin3.init = jest.fn((_, nxt) => {
            nxt({ response, status: Status.COMPLETE });
        });

        return req({ url: '' }).then((result) => {
            expect(result).toBe(response);
            expect(plugin1.init).toHaveBeenCalled();
            expect(plugin2.init).toHaveBeenCalled();
            expect(plugin3.init).toHaveBeenCalledWith(expect.any(Context), expect.any(Function), expect.any(Function));
            expect(plugin4.init).not.toHaveBeenCalled(); // not called cause plugin3 changes status

            expect(plugin1.complete).toHaveBeenCalled();
            expect(plugin2.complete).toHaveBeenCalled();
            expect(plugin3.complete).not.toHaveBeenCalled(); // not called at all
            expect(plugin4.complete).not.toHaveBeenCalled();
        });
    });

    it('rejects promise if status is ERROR', () => {
        const plugin1 = createPlugin();
        const plugin2 = createPlugin();
        const req = request([plugin1, plugin2]);
        const error = new Error('123');

        plugin2.init = jest.fn((_, nxt) => {
            nxt({ error, status: Status.ERROR });
        });

        return req({ url: '' }).catch((err) => {
            expect(err).toBe(error);
            expect(plugin2.init).toHaveBeenCalledWith(expect.any(Context), expect.any(Function), expect.any(Function));
            expect(plugin1.error).toHaveBeenCalledWith(expect.any(Context), expect.any(Function), expect.any(Function));
            expect(plugin2.error).not.toHaveBeenCalled();
        });
    });

    it('should handle case when plugin calls next several times', () => {
        const plugin1 = createPlugin();
        const plugin2 = createPlugin();
        const req = request([plugin1, plugin2]);
        const error = new Error('123');

        plugin1.complete = jest.fn((_, nxt) => {
            setTimeout(nxt, 10);
        });

        plugin2.init = jest.fn((_, nxt) => {
            nxt({ status: Status.COMPLETE });
            nxt({ error, status: Status.ERROR });
        });

        return req({ url: '' }).then(() => {
            expect(plugin1.init).toHaveBeenCalledTimes(1);
            expect(plugin1.complete).toHaveBeenCalledTimes(1);
            expect(plugin1.error).toHaveBeenCalledTimes(0);
            expect(plugin2.init).toHaveBeenCalledTimes(1);
            expect(plugin2.complete).toHaveBeenCalledTimes(0);
            expect(plugin2.error).toHaveBeenCalledTimes(0);
        });
    });

    it('should handle errors at plugins execution 1', () => {
        const plugin1 = createPlugin();
        const plugin2 = createPlugin();
        const req = request([plugin1, plugin2]);
        const error = new Error('123');
        let handledError;

        plugin1.error = jest.fn((context, nxt) => {
            handledError = context.getState().error;
            nxt();
        });

        plugin2.complete = jest.fn((_, nxt) => {
            throw error;
        });

        return req({ url: '' })
            .then(() => {
                expect(true).toBe(false);
            })
            .catch((err) => {
                expect(err).toBe(error);
                expect(handledError).toBe(error);
                expect(plugin1.complete).not.toHaveBeenCalled();
                expect(plugin2.complete).toHaveBeenCalledWith(
                    expect.any(Context),
                    expect.any(Function),
                    expect.any(Function)
                );
                expect(plugin1.error).toHaveBeenCalledWith(
                    expect.any(Context),
                    expect.any(Function),
                    expect.any(Function)
                );
            });
    });

    it('should handle errors at plugins execution 2', () => {
        const plugin1 = createPlugin();
        const plugin2 = createPlugin();
        const req = request([plugin1, plugin2]);
        const error1 = new Error('123');
        const error2 = new Error('456');
        let handledError;

        plugin1.error = jest.fn((context, _) => {
            handledError = context.getState().error;
            throw error2;
        });

        plugin2.complete = jest.fn((_, nxt) => {
            setTimeout(() => nxt({ status: Status.ERROR, error: error1 }), 10);
        });

        return req({ url: '' })
            .then(() => {
                expect(true).toBe(false);
            })
            .catch((err) => {
                expect(err).toBe(error2);
                expect(handledError).toBe(error1);
                expect(plugin1.error).toHaveBeenCalledWith(
                    expect.any(Context),
                    expect.any(Function),
                    expect.any(Function)
                );
                expect(plugin2.error).not.toHaveBeenCalled();
            });
    });
});
