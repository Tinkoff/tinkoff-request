/**
 * @jest-environment jsdom
 */
import { FetchMock } from 'jest-fetch-mock';
import { Context, Status } from '@tinkoff/request-core';
import http from './http';

const fetch: FetchMock = require('jest-fetch-mock');
jest.mock(
    'node-fetch',
    () =>
        (...args) =>
            fetch(...args)
);

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

        plugin.init!(new Context({ request: { url: 'test' } }), next, null as any);

        jest.runAllTimers();

        expect(mockResponse).toBeCalled();
        expect(fetch).toHaveBeenCalledWith('test', {
            method: 'GET',
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

        plugin.init!(
            new Context({
                request: {
                    payload,
                    attaches,
                    url: 'attaches',
                    httpMethod: 'PUT',
                },
            }),
            next,
            null as any
        );
        plugin.init!(
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
            null as any
        );

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockResponse).toBeCalled();
    });

    it('error request', async () => {
        const response = { a: '1', b: 2 };
        const mockResponse = jest.fn(() =>
            Promise.resolve({
                init: {
                    status: 503,
                    headers: {
                        'Content-type': 'application/json;',
                    },
                },
                body: JSON.stringify(response),
            })
        );

        fetch.mockResponse(mockResponse);

        plugin.init!(new Context({ request: { url: 'test' } }), next, null as any);

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockResponse).toBeCalled();
        expect(next).toHaveBeenLastCalledWith({
            status: Status.ERROR,
            error: expect.objectContaining({
                code: 'ERR_HTTP_ERROR',
                message: 'Service Unavailable',
                status: 503,
                body: response,
            }),
            response,
        });
    });

    it('request unknown error', async () => {
        const mockResponse = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));

        fetch.mockResponse(mockResponse);

        plugin.init!(new Context({ request: { url: 'test' } }), next, null as any);

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

        http({ agent: { http: new MockedAgent() as any, https: new MockedAgent() as any } }).init?.(
            new Context({ request: { url: 'http://test.com/api' } }),
            next,
            null as any
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

    it('request with custom querySerializer', async () => {
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

        const mockQuerySerializer = jest.fn(() => 'query-string');

        http({ querySerializer: mockQuerySerializer }).init?.(
            new Context({ request: { url: 'http://test.com/api?test=123', query: { a: '1' } } }),
            next,
            null as any
        );

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockResponse).toBeCalled();

        expect(mockQuerySerializer).toHaveBeenCalledWith({ a: '1' }, 'test=123');
    });

    it('plugin should call next function once after aborting', async () => {
        const response = { a: 3 };
        const mockResponse = jest.fn(() => Promise.resolve({ body: JSON.stringify(response) }));
        let abort;

        fetch.mockResponse(mockResponse);

        plugin.init!(
            new Context({
                request: {
                    url: 'http://test.com/api',
                    abortPromise: new Promise((res) => {
                        abort = res;
                    }),
                },
            }),
            next,
            null as any
        );

        abort('abort test');

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenLastCalledWith({
            error: expect.objectContaining({
                code: 'ABORT_ERR',
                abortOptions: 'abort test',
            }),
            status: Status.ERROR,
        });
    });

    it('plugin should accept signal that can abort request', async () => {
        const response = { a: 3 };
        const mockResponse = jest.fn(() => Promise.resolve({ body: JSON.stringify(response) }));

        fetch.mockResponse(mockResponse);

        const abortController = new AbortController();

        plugin.init!(
            new Context({
                request: {
                    url: 'http://test.com/api',
                    signal: abortController.signal,
                },
            }),
            next,
            null as any
        );
        const promise = new Promise((res) => {
            next.mockImplementation(res);
        });

        abortController.abort();

        await promise;

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenLastCalledWith({
            error: expect.objectContaining({
                code: 'ABORT_ERR',
            }),
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

        plugin.init!(
            new Context({
                request: {
                    url: 'http://test.com/api',
                    abortPromise: new Promise((res) => {
                        abort = res;
                    }),
                },
            }),
            next,
            null as any
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

    it('should convert httpMethod to uppercase', async () => {
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

        plugin.init!(new Context({ request: { url: 'method-patch', httpMethod: 'patch' } }), next, null as any);

        jest.runAllTimers();

        expect(mockResponse).toBeCalled();
        expect(fetch).toHaveBeenCalledWith('method-patch', {
            method: 'PATCH',
            credentials: 'same-origin',
            body: '',
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

    it('timeout', async () => {
        const response = { a: 1 };
        const mockResponse = jest.fn(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(response);
                }, 2000);
            });
        });

        fetch.mockResponse(mockResponse as any);

        plugin.init!(new Context({ request: { url: 'timeout', timeout: 500 } }), next, null as any);

        jest.runAllTimers();

        expect(mockResponse).toBeCalled();

        expect(next).toHaveBeenLastCalledWith({
            error: expect.objectContaining({
                code: 'ERR_HTTP_REQUEST_TIMEOUT',
                message: 'Request timed out',
            }),
            status: Status.ERROR,
        });
    });

    it('internal timeout', async () => {
        const mockResponse = jest.fn(() => {
            return Promise.reject(
                Object.assign(new Error('network timeout at: timeout'), {
                    type: 'request-timeout',
                })
            );
        });

        fetch.mockResponse(mockResponse);

        plugin.init!(new Context({ request: { url: 'timeout' } }), next, null as any);

        jest.runAllTimers();

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockResponse).toBeCalled();

        expect(next).toHaveBeenLastCalledWith({
            error: expect.objectContaining({
                code: 'ERR_HTTP_REQUEST_TIMEOUT',
                message: 'Request timed out',
            }),
            status: Status.ERROR,
        });
    });
});
