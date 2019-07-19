import { Context } from '@tinkoff/request-core';
import getCacheKey from './getCacheKey';
import { CACHE } from './constants/metaTypes';

const context = {
    getInternalMeta: jest.fn(),
    getRequest: jest.fn(),
    updateInternalMeta: jest.fn(),
};

describe('utils/getCacheKey', () => {
    beforeEach(() => {
        context.getInternalMeta.mockClear();
        context.getRequest.mockClear();
        context.updateInternalMeta.mockClear();
    });

    it('if already in meta just return it', () => {
        context.getInternalMeta.mockImplementation(() => ({ key: 'test' }));

        expect(getCacheKey((context as any) as Context)).toBe('test');
        expect(context.getInternalMeta).toHaveBeenCalledWith(CACHE);
        expect(context.getRequest).not.toHaveBeenCalled();
    });

    it('if not in meta create new and returns', () => {
        const request = { a: 1, b: 2 };
        const getKey = jest.fn(() => 'test');

        context.getInternalMeta.mockImplementation(() => ({}));
        context.getRequest.mockImplementation(() => request);

        expect(getCacheKey((context as any) as Context, getKey)).toBe('test');
        expect(getKey).toHaveBeenCalledWith(request);
        expect(context.updateInternalMeta).toHaveBeenCalledWith(CACHE, { key: 'test' });
        expect(context.getInternalMeta).toHaveBeenCalledWith(CACHE);
        expect(context.getRequest).toHaveBeenCalled();
    });

    it('if not in meta create new and returns, generated key is too long', () => {
        const request = { a: 1, b: 2 };
        const key =
            'aaaaaaaaaaaa aaaaaaaaaaaaaaaaaaaaaaaaaaa bbbbbbbbbbbbbbbbbb aaaaaaaaaaaaaaaaaaa bbbbbbbbbbbbbbb aaaaaaaaaaaaaaa';
        const getKey = jest.fn(() => key);

        context.getInternalMeta.mockImplementation(() => ({}));
        context.getRequest.mockImplementation(() => request);

        expect(getCacheKey((context as any) as Context, getKey)).toBe(key);
        expect(getKey).toHaveBeenCalledWith(request);
        expect(context.updateInternalMeta).toHaveBeenCalledWith(CACHE, { key: key });
        expect(context.getInternalMeta).toHaveBeenCalledWith(CACHE);
        expect(context.getRequest).toHaveBeenCalled();
    });
});
