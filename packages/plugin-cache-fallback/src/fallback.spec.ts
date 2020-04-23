import { Context, Status } from '@tinkoff/request-core';
import { metaTypes } from '@tinkoff/request-cache-utils';
import fallback from './fallback';

const next = jest.fn();
const getCacheKey = jest.fn((req) => req.url);
const driver = {
    get: jest.fn(),
    set: jest.fn(),
};

const wait = async (n = 1) => {
    for (let i = 0; i < n; i++) {
        await Promise.resolve();
    }
};

describe('plugins/cache/fallback', () => {
    beforeEach(() => {
        next.mockClear();
        getCacheKey.mockClear();
        driver.get.mockClear();
        driver.set.mockClear();
    });

    it('save to cache on complete', async () => {
        const request = { url: 'test[123]//pf' };
        const response = { a: 1, b: 2 };
        const plugin = fallback({ getCacheKey, shouldExecute: true, driver });
        const context = new Context({ request, response });

        plugin.complete(context, next, null);
        await wait();
        expect(getCacheKey).toHaveBeenLastCalledWith(request);
        expect(driver.set).toHaveBeenLastCalledWith(request.url, response);
        expect(driver.get).not.toHaveBeenCalled();
    });

    it('tries return from cache on error', async () => {
        const fromCache = { test: 'pfpf' };
        const request = { url: 'test[123]//pf' };
        const error = new Error('123');
        const plugin = fallback({ getCacheKey, shouldExecute: true, driver });
        const context = new Context({ request, error });
        const next = jest.fn();

        driver.get.mockImplementation(() => fromCache);
        context.updateExternalMeta = jest.fn(context.updateExternalMeta.bind(context));

        plugin.error(context, next, null);
        await wait(2);
        expect(getCacheKey).toHaveBeenLastCalledWith(request);
        expect(driver.set).not.toHaveBeenCalled();
        expect(driver.get).toHaveBeenLastCalledWith(request.url);
        expect(context.updateExternalMeta).toHaveBeenLastCalledWith(metaTypes.CACHE, { fallbackCache: true });
        expect(next).toHaveBeenLastCalledWith({ status: Status.COMPLETE, response: fromCache });
    });

    it('tries return from cache on error, but persist cache errors', async () => {
        const request = { url: 'test[123]//pf' };
        const error = new Error('123');
        const plugin = fallback({ getCacheKey, shouldExecute: true, driver });
        const context = new Context({ request, error });
        const next = jest.fn();

        driver.get.mockImplementation(() => {
            throw error;
        });
        context.updateExternalMeta = jest.fn(context.updateExternalMeta.bind(context));

        plugin.error(context, next, null);
        await wait(2);
        expect(getCacheKey).toHaveBeenLastCalledWith(request);
        expect(driver.set).not.toHaveBeenCalled();
        expect(driver.get).toHaveBeenLastCalledWith(request.url);
        expect(context.updateExternalMeta).not.toHaveBeenLastCalledWith(metaTypes.CACHE, { fromFallback: true });
        expect(next).toHaveBeenLastCalledWith();
    });

    it('if shouldFallback returns false, do not use cache', () => {
        const request = { url: 'test[123]//pf' };
        const error = new Error('123');
        const shouldFallback = jest.fn(() => false);
        const plugin = fallback({ getCacheKey, shouldFallback, shouldExecute: true, driver });
        const context = new Context({ request, error });
        const next = jest.fn();

        context.updateExternalMeta = jest.fn(context.updateExternalMeta.bind(context));

        plugin.error(context, next, null);
        expect(shouldFallback).toHaveBeenCalledWith(context.getState());
        expect(getCacheKey).not.toHaveBeenCalled();
        expect(driver.set).not.toHaveBeenCalled();
        expect(driver.get).not.toHaveBeenCalled();
        expect(context.updateExternalMeta).not.toHaveBeenCalled();
        expect(next).toHaveBeenLastCalledWith();
    });
});
