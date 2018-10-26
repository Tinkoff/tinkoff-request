import { Context } from '@tinkoff/request-core';
import getCacheKey from './getCacheKey';
import { CACHE } from './constants/metaTypes';

const context = {
    getMeta: jest.fn(),
    getRequest: jest.fn(),
    updateMeta: jest.fn()
};

describe('utils/getCacheKey', () => {
    beforeEach(() => {
        context.getMeta.mockClear();
        context.getRequest.mockClear();
        context.updateMeta.mockClear();
    });

    it('if already in meta just return it', () => {
        context.getMeta.mockImplementation(() => ({ key: 'test' }));

        expect(getCacheKey(context as any as Context)).toBe('test');
        expect(context.getMeta).toHaveBeenCalledWith(CACHE);
        expect(context.getRequest).not.toHaveBeenCalled();
    });

    it('if not in meta create new and returns', () => {
        const request = { a: 1, b: 2 };
        const getKey = jest.fn(() => 'test');

        context.getMeta.mockImplementation(() => ({}));
        context.getRequest.mockImplementation(() => request);

        expect(getCacheKey(context as any as Context, getKey)).toBe('test');
        expect(getKey).toHaveBeenCalledWith(request);
        expect(context.updateMeta).toHaveBeenCalledWith(CACHE, { key: 'test' });
        expect(context.getMeta).toHaveBeenCalledWith(CACHE);
        expect(context.getRequest).toHaveBeenCalled();
    });

    it('if not in meta create new and returns, generated key is too long', () => {
        const request = { a: 1, b: 2 };
        const key = 'aaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaa bbbbbbbbbbbbbbbbbb aaaaaaaaaaaaaaaaaaa bbbbbbbbbbbbbbb aaaaaaaaaaaaaaa';
        const getKey = jest.fn(() => key);

        context.getMeta.mockImplementation(() => ({}));
        context.getRequest.mockImplementation(() => request);

        expect(getCacheKey(context as any as Context, getKey)).toBe(key);
        expect(getKey).toHaveBeenCalledWith(request);
        expect(context.updateMeta).toHaveBeenCalledWith(CACHE, { key: key });
        expect(context.getMeta).toHaveBeenCalledWith(CACHE);
        expect(context.getRequest).toHaveBeenCalled();
    });
});
