import { Context, Status } from '@tinkoff/request-core';
import { metaTypes } from '@tinkoff/request-cache-utils';
import fallback from './fallback';

const next = jest.fn();
const getCacheKey = jest.fn(req => req.url);
const mockPersistentCache = {
    get: jest.fn(),
    put: jest.fn()
};

jest.mock('./persistent-cache', () => ({ default: () => mockPersistentCache }));

describe('plugins/cache/fallback', () => {
    beforeEach(() => {
        next.mockClear();
        getCacheKey.mockClear();
        mockPersistentCache.put.mockClear();
        mockPersistentCache.get.mockClear();
    });

    it('save to cache on complete', () => {
        const request = { url: 'test[123]//pf' };
        const response = { a: 1, b: 2 };
        const plugin = fallback({ getCacheKey, shouldExecute: true });
        const context = new Context({ request, response });

        plugin.complete(context, next, null);
        expect(getCacheKey).toHaveBeenLastCalledWith(request);
        expect(mockPersistentCache.put).toHaveBeenLastCalledWith(encodeURIComponent(request.url), response, expect.any(Function));
        expect(mockPersistentCache.get).not.toHaveBeenCalled();
    });

    it('tries return from cache on error', () => {
        const fromCache = { test: 'pfpf' };
        const request = { url: 'test[123]//pf' };
        const error = new Error('123');
        const plugin = fallback({ getCacheKey, shouldExecute: true });
        const context = new Context({ request, error });
        const next = jest.fn();

        mockPersistentCache.get.mockImplementation((_, cb) => cb(null, fromCache));
        context.updateMeta = jest.fn(context.updateMeta.bind(context));

        plugin.error(context, next, null);
        expect(getCacheKey).toHaveBeenLastCalledWith(request);
        expect(mockPersistentCache.put).not.toHaveBeenCalled();
        expect(mockPersistentCache.get).toHaveBeenLastCalledWith(encodeURIComponent(request.url), expect.any(Function));
        expect(context.updateMeta).toHaveBeenLastCalledWith(metaTypes.CACHE, { fallbackCache: true });
        expect(next).toHaveBeenLastCalledWith({ status: Status.COMPLETE, response: fromCache });
    });

    it('tries return from cache on error, but persist cache errors', () => {
        const request = { url: 'test[123]//pf' };
        const error = new Error('123');
        const plugin = fallback({ getCacheKey, shouldExecute: true });
        const context = new Context({ request, error });
        const next = jest.fn();

        mockPersistentCache.get.mockImplementation((_, cb) => cb(error));
        context.updateMeta = jest.fn(context.updateMeta.bind(context));

        plugin.error(context, next, null);
        expect(getCacheKey).toHaveBeenLastCalledWith(request);
        expect(mockPersistentCache.put).not.toHaveBeenCalled();
        expect(mockPersistentCache.get).toHaveBeenLastCalledWith(encodeURIComponent(request.url), expect.any(Function));
        expect(context.updateMeta).not.toHaveBeenLastCalledWith(metaTypes.CACHE, { fromFallback: true });
        expect(next).toHaveBeenLastCalledWith();
    });

    it('if shouldFallback returns false, do not use cache', () => {
        const request = { url: 'test[123]//pf' };
        const error = new Error('123');
        const shouldFallback = jest.fn(() => false);
        const plugin = fallback({ getCacheKey, shouldFallback, shouldExecute: true });
        const context = new Context({ request, error });
        const next = jest.fn();

        context.updateMeta = jest.fn(context.updateMeta.bind(context));

        plugin.error(context, next, null);
        expect(shouldFallback).toHaveBeenCalledWith(context.getState());
        expect(getCacheKey).not.toHaveBeenCalled();
        expect(mockPersistentCache.put).not.toHaveBeenCalled();
        expect(mockPersistentCache.get).not.toHaveBeenCalled();
        expect(context.updateMeta).not.toHaveBeenCalled();
        expect(next).toHaveBeenLastCalledWith();
    });
});
