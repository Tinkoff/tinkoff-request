import { Context, Status } from '@tinkoff/request-core';
import { metaTypes } from '@tinkoff/request-cache-utils';
import persistent from './persistent';

const mockStore = { store: 'test' };
const mockIDB = {
    get: jest.fn(),
    set: jest.fn(),
    // tslint:disable-next-line
    Store() {
        return mockStore;
    }
};

jest.mock('idb-keyval', () => mockIDB);

const context = new Context({ request: { url: 'test' } });

context.updateMeta = jest.fn(context.updateMeta.bind(context));
const getCacheKey = jest.fn(req => req.url);
const next = jest.fn();

describe('plugins/cache/persistent', () => {
    let indexedDB;
    let plugin;

    beforeAll(() => {
        indexedDB = window.indexedDB;
    });

    afterAll(() => {
        (window as any).indexedDB = indexedDB;
    });

    beforeEach(() => {
        mockIDB.get.mockClear();
        mockIDB.set.mockClear();
        next.mockClear();
        context.setState({ meta: {} });
        (context.updateMeta as jest.Mock).mockClear();
        (window as any).indexedDB = {};
        plugin = persistent({ getCacheKey, shouldExecute: true });
    });

    it('only for browsers', () => {
        (window as any).indexedDB = undefined;

        expect(persistent({ shouldExecute: true })).toEqual({});

        (window as any).indexedDB = {};

        expect(persistent({ shouldExecute: true })).toEqual({
            shouldExecute: expect.any(Function),
            init: expect.any(Function),
            complete: expect.any(Function)
        });
    });

    it('init no value in indexedDB', () => {
        mockIDB.get.mockImplementation(() => Promise.resolve());

        plugin.init(context, next, null);

        expect(mockIDB.get).toHaveBeenCalledWith('test', mockStore);
        return Promise.resolve()
            .then(() => {
                expect(context.updateMeta).not.toHaveBeenCalledWith(metaTypes.CACHE, {
                    fromPersistCache: true
                });
                expect(next).toHaveBeenCalledWith();
            });
    });

    it('init, value in indexedDB', () => {
        const response = { a: 2 };

        mockIDB.get.mockImplementation(() => Promise.resolve(response));

        plugin.init(context, next, null);

        return Promise.resolve()
            .then(() => {
                expect(context.updateMeta).toHaveBeenCalledWith(metaTypes.CACHE, {
                    persistentCache: true
                });
                expect(next).toHaveBeenCalledWith({
                    response,
                    status: Status.COMPLETE,
                });
            });
    });

    it('on complete saves to cache', () => {
        const response = { a: 3 };

        context.setState({ response });

        plugin.complete(context, next, null);

        expect(next).toHaveBeenCalled();
        expect(mockIDB.set).toHaveBeenCalledWith('test', response, mockStore);
    });
});
