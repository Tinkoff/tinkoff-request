import { FetchMock } from 'jest-fetch-mock';
import { Context, Status } from '@tinkoff/request-core';
import http from './http';

const fetch: FetchMock = require('jest-fetch-mock');
jest.mock('node-fetch', () => (...args) => fetch(...args));

const plugin = http();
const next = jest.fn();

describe('plugins/http', () => {
    beforeEach(() => {
        fetch.resetMocks();
        next.mockClear();
    });

    it('request get', async () => {
        const response = { a: 3 };
        const mockResponse = jest.fn(() =>
            Promise.resolve({
                body: JSON.stringify(response),
                init: {
                    headers: {
                        'Content-type': 'application/json;',
                    },
                },
            })
        );

        fetch.mockResponse(mockResponse);

        plugin.init(new Context({ request: { url: 'test' } }), next, null);

        jest.runAllTimers();

        expect(mockResponse).toBeCalled();
        expect(fetch).toHaveBeenCalledWith('test', {
            method: 'get',
            credentials: 'same-origin',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
            },
            signal: expect.anything(),
        });

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(next).toHaveBeenLastCalledWith({
            response,
            status: Status.COMPLETE,
        });
    });

    it('request attaches', async () => {
        const mockResponse = jest.fn(() => Promise.resolve({ body: '' }));
        const payload = {
            key: 'value',
        };
        const attaches = [
            { name: 'file1' },
            { name: 'file2' },
            Object.assign(new Blob(), {
                on: () => {},
                pause: () => {},
                resume: () => {},
                name: 'file3',
            }),
        ];

        fetch.mockResponse(mockResponse);

        plugin.init(
            new Context({
                request: {
                    payload,
                    attaches,
                    url: 'attaches',
                    httpMethod: 'PUT',
                },
            }),
            next,
            null
        );
        plugin.init(
            new Context({
                request: {
                    payload,
                    attaches,
                    url: 'attaches',
                    httpMethod: 'POST',
                    encodeFileName: true,
                },
            }),
            next,
            null
        );

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockResponse).toBeCalled();
    });

    it('error request', async () => {
        const mockResponse = jest.fn(() =>
            Promise.resolve({
                init: {
                    status: 503,
                    headers: {
                        'Content-type': 'application/json;',
                    },
                },
                body: JSON.stringify({ a: '1', b: 2 }),
            })
        );

        fetch.mockResponse(mockResponse);

        plugin.init(new Context({ request: { url: 'test' } }), next, null);

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockResponse).toBeCalled();
        expect(next).toHaveBeenLastCalledWith({
            status: Status.ERROR,
            error: new Error('Service Unavailable'),
            response: { a: '1', b: 2 },
        });
    });

    it('request unknown error', async () => {
        const mockResponse = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));

        fetch.mockResponse(mockResponse);

        plugin.init(new Context({ request: { url: 'test' } }), next, null);

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockResponse).toBeCalled();
        expect(next).toHaveBeenLastCalledWith({
            status: Status.ERROR,
            error: new TypeError('Failed to fetch'),
        });
    });

    it('request with custom agent', async () => {
        const response = { a: 3 };
        const mockResponse = jest.fn(() =>
            Promise.resolve({
                body: JSON.stringify(response),
                init: {
                    headers: {
                        'Content-type': 'application/json;',
                    },
                },
            })
        );

        fetch.mockResponse(mockResponse);

        class MockedAgent {
            requests() {}
            destroy() {}
        }

        http({ agent: { http: new MockedAgent() as any, https: new MockedAgent() as any } }).init(
            new Context({ request: { url: 'http://test.com/api' } }),
            next,
            null
        );

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockResponse).toBeCalled();
        expect(next).toHaveBeenLastCalledWith({
            response,
            status: Status.COMPLETE,
        });
    });

    it('plugin should call next function once after aborting', async () => {
        const response = { a: 3 };
        const mockResponse = jest.fn(() => Promise.resolve({ body: JSON.stringify(response) }));
        let abort;

        fetch.mockResponse(mockResponse);

        plugin.init(
            new Context({
                request: {
                    url: 'http://test.com/api',
                    abortPromise: new Promise((res) => {
                        abort = res;
                    }),
                },
            }),
            next,
            null
        );

        abort('abort test');

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenLastCalledWith({
            error: 'abort test',
            status: Status.ERROR,
        });
    });

    it('abort should do nothing after request ended', async () => {
        const response = { a: 3 };
        const mockResponse = jest.fn(() =>
            Promise.resolve({
                body: JSON.stringify(response),
                init: {
                    headers: {
                        'Content-type': 'application/json;',
                    },
                },
            })
        );
        let abort;

        fetch.mockResponse(mockResponse);

        plugin.init(
            new Context({
                request: {
                    url: 'http://test.com/api',
                    abortPromise: new Promise((res) => {
                        abort = res;
                    }),
                },
            }),
            next,
            null
        );

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        abort('abort after');

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenLastCalledWith({
            response,
            status: Status.COMPLETE,
        });
    });
});
