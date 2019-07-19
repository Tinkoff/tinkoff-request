import { Context, Status } from '@tinkoff/request-core';
import { metaTypes } from '@tinkoff/request-cache-utils';
import etagCache from './etag';
import { ETAG } from './constants';

const mockLru = {
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
    peek: jest.fn(),
};

jest.mock('lru-cache', () => () => mockLru);

const getCacheKey = jest.fn((req) => req.url);
const plugin = etagCache({ getCacheKey });
const next = jest.fn();
const context = new Context({ request: { url: 'test' } });

context.updateExternalMeta = jest.fn(context.updateExternalMeta.bind(context));
context.updateInternalMeta = jest.fn(context.updateInternalMeta.bind(context));

describe('plugins/cache/etag', () => {
    beforeEach(() => {
        mockLru.get.mockClear();
        mockLru.set.mockClear();
        mockLru.has.mockClear();
        mockLru.peek.mockClear();
        next.mockClear();
        (context as any).internalMeta = {};
        (context.updateExternalMeta as any).mockClear();
        (context.updateInternalMeta as any).mockClear();
    });

    it('init: no cache value', () => {
        mockLru.has.mockImplementation(() => false);
        plugin.init(context, next, null);

        expect(getCacheKey).toHaveBeenCalledWith({ url: 'test' });
        expect(mockLru.has).toHaveBeenCalledWith('test');
        expect(mockLru.get).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
    });

    it('init: value from cache', () => {
        const etag = 'etag123456';
        const response = { a: 1 };

        mockLru.has.mockImplementation(() => true);
        mockLru.get.mockImplementation(() => ({ key: etag, value: response }));
        plugin.init(context, next, null);

        expect(mockLru.get).toHaveBeenCalledWith('test');
        expect(context.updateInternalMeta).toHaveBeenCalledWith(ETAG, {
            value: response,
        });
        expect(next).toHaveBeenCalledWith({
            request: {
                url: 'test',
                headers: {
                    'If-None-Match': etag,
                },
            },
        });
    });

    it('complete: should ignore responses without etag header', () => {
        const getHeader = jest.fn();

        context.updateInternalMeta('PROTOCOL_HTTP', {
            response: {
                get: getHeader,
            },
        });

        plugin.complete(context, next, null);

        expect(getHeader).toHaveBeenCalledWith('etag');
        expect(mockLru.set).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
    });

    it('complete: should save value on complete if etag header is present', () => {
        const response = { a: 1 };
        const etag = 'test1231245';
        const getHeader = jest.fn(() => etag);

        context.setState({ response });
        context.updateInternalMeta('PROTOCOL_HTTP', {
            response: {
                get: getHeader,
            },
        });

        plugin.complete(context, next, null);

        expect(getHeader).toHaveBeenCalledWith('etag');
        expect(mockLru.set).toHaveBeenCalledWith('test', {
            key: etag,
            value: response,
        });
        expect(next).toHaveBeenCalledWith();
    });

    it('error: should do nothing if status is distinct from 304 ', () => {
        context.setState({ error: Object.assign(new Error(), { status: 305 }) });

        plugin.error(context, next, null);
        expect(context.updateInternalMeta).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
    });

    it('error: should do nothing if status is 304 but cache is empty', () => {
        context.setState({ error: Object.assign(new Error(), { status: 304 }) });

        plugin.error(context, next, null);
        expect(context.updateExternalMeta).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith();
    });

    it('error: if request failed with 304 status return value from cache', () => {
        const response = { a: 1 };
        context.updateInternalMeta(ETAG, {
            value: response,
        });
        context.setState({ error: Object.assign(new Error(), { status: 304 }) });

        plugin.error(context, next, null);
        expect(context.updateExternalMeta).toHaveBeenCalledWith(metaTypes.CACHE, {
            etagCache: true,
        });
        expect(next).toHaveBeenCalledWith({
            status: Status.COMPLETE,
            response,
        });
    });
});
