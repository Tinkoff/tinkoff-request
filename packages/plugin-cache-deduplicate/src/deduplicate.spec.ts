import applyOrReturn from '@tinkoff/utils/function/applyOrReturn';
import { Context, Status } from '@tinkoff/request-core';
import { metaTypes } from '@tinkoff/request-cache-utils';
import deduplicate from './deduplicate';

const requests = [{ url: 'first', r: 1 }, { url: 'first', r: 2 }, { url: 'third', r: 3 }, { url: 'first', r: 4 }];

describe('plugins/cache/deduplicate', () => {
    const deduplicateFunc = jest.fn((req) => req.url);

    it('test plugin shouldExecute', () => {
        const context = new Context();

        expect(applyOrReturn([context], deduplicate({ shouldExecute: false }).shouldExecute)).toBeFalsy();
        expect(applyOrReturn([context], deduplicate({ shouldExecute: true }).shouldExecute)).toBeTruthy();
        context.setState({ request: { deduplicateCache: false, url: '' } });
        expect(applyOrReturn([context], deduplicate({ shouldExecute: true }).shouldExecute)).toBeFalsy();
        context.setState({ request: { deduplicateCache: true, url: '' } });
        expect(applyOrReturn([context], deduplicate({ shouldExecute: true }).shouldExecute)).toBeTruthy();
    });

    it('test plugin after success request', () => {
        const plugin = deduplicate({ shouldExecute: true, getCacheKey: deduplicateFunc });
        const next = jest.fn();
        const response = { test: 123 };

        requests.forEach((request, index) => {
            const context = new Context({ request });

            context.updateExternalMeta = jest.fn(context.updateExternalMeta.bind(context));
            context.updateInternalMeta = jest.fn(context.updateInternalMeta.bind(context));

            plugin.init(context, next, null);
            expect(context.updateInternalMeta).toHaveBeenCalledWith(metaTypes.CACHE, { key: request.url });
            if (request.url === 'first' && index !== 0) {
                expect(context.updateExternalMeta).toHaveBeenCalledWith(metaTypes.CACHE, { deduplicated: true });
            }
        });
        expect(next).toHaveBeenCalledTimes(2);
        plugin.complete(new Context({ response, request: requests[0], status: Status.COMPLETE }), next, null);
        expect(next).toHaveBeenCalledTimes(5); // 4 requests init + 1 complete
        requests.forEach((request) => {
            expect(next).toHaveBeenCalledWith({ response, status: Status.COMPLETE, error: null });
        });
    });

    it('test plugin after error request', () => {
        const plugin = deduplicate({ shouldExecute: true, getCacheKey: deduplicateFunc });
        const next = jest.fn();
        const error = new Error('text');

        requests.forEach((request, index) => {
            const context = new Context({ request });

            context.updateExternalMeta = jest.fn(context.updateExternalMeta.bind(context));
            context.updateInternalMeta = jest.fn(context.updateInternalMeta.bind(context));

            plugin.init(context, next, null);
            expect(context.updateInternalMeta).toHaveBeenCalledWith(metaTypes.CACHE, { key: request.url });
            if (request.url === 'first' && index !== 0) {
                expect(context.updateExternalMeta).toHaveBeenCalledWith(metaTypes.CACHE, { deduplicated: true });
            }
        });
        expect(next).toHaveBeenCalledTimes(2);
        plugin.error(new Context({ error, request: requests[0], status: Status.ERROR }), next, null);
        expect(next).toHaveBeenCalledTimes(5); // 4 requests init + 1 complete
        requests.forEach((request) => {
            expect(next).toHaveBeenCalledWith({ error, status: Status.ERROR, response: null });
        });
    });
});
