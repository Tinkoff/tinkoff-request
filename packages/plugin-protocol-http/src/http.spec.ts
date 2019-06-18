import request from 'superagent';
import mocker from 'superagent-mocker-tinkoff';
import { Context, Status } from '@tinkoff/request-core';
import http, { getProtocol } from './http';

const plugin = http();
const next = jest.fn();
const mockJsonp = jest.fn((arg) => () => {});

jest.mock('superagent-jsonp', () => (arg) => mockJsonp(arg));

describe('plugins/http', () => {
    beforeAll(() => {
        mocker(request);
    });

    afterAll(() => {
        mocker.clearRoutes();
    });

    beforeEach(() => {
        next.mockClear();
        mocker.clearRoutes();
    });

    it('request get', () => {
        const response = { a: 3 };
        const mockRequest = jest.fn(() => ({ body: response }));

        mocker.get('test', mockRequest);

        plugin.init(new Context({ request: { url: 'test' } }), next, null);

        jest.runAllTimers();

        expect(mockRequest).toBeCalled();
        expect(next).toHaveBeenLastCalledWith({
            response,
            status: Status.COMPLETE,
        });
    });

    it('test request params', () => {
        const mockRequest = jest.fn();
        const jsonpObject = {};

        mocker.post('test', mockRequest);

        plugin.init(
            new Context({
                request: {
                    url: 'test',
                    httpMethod: 'POST',
                    withCredentials: true,
                    jsonp: jsonpObject,
                    payload: {},
                    attaches: ['file'],
                    onProgress: () => {},
                },
            }),
            next,
            null
        );

        jest.runAllTimers();

        expect(mockRequest).toBeCalled();
        expect(mockJsonp).toBeCalledWith(jsonpObject);
    });

    it('request attaches', () => {
        const mockRequest = jest.fn();
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

        mocker.put('attaches', mockRequest);
        mocker.post('attaches', mockRequest);

        plugin.init(
            new Context({
                request: {
                    payload,
                    attaches,
                    url: 'attaches',
                    httpMethod: 'PUT',
                    jsonp: true,
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
                    jsonp: true,
                    encodeFileName: true,
                },
            }),
            next,
            null
        );

        jest.runAllTimers();

        expect(mockRequest).toBeCalled();
        expect(mockJsonp).toBeCalledWith(undefined);
    });

    it('error request', () => {
        const mockRequest = jest.fn(() => ({ status: 503, body: 123 }));

        mocker.get('test', mockRequest);

        plugin.init(new Context({ request: { url: 'test' } }), next, null);

        jest.runAllTimers();

        expect(mockRequest).toBeCalled();
        expect(next).toHaveBeenLastCalledWith({
            status: Status.ERROR,
            error: new Error('503'),
            response: null,
        });
    });

    it('request with custom agent', () => {
        const response = { a: 3 };
        const mockRequest = jest.fn(() => ({ body: response }));

        mocker.get('http://test.com/api', mockRequest);
        class MockedAgent {
            requests() {}
            destroy() {}
        }

        http({ agent: { http: new MockedAgent() as any, https: new MockedAgent() as any } }).init(
            new Context({ request: { url: 'http://test.com/api' } }),
            next,
            null
        );

        jest.runAllTimers();

        expect(mockRequest).toBeCalled();
        expect(next).toHaveBeenLastCalledWith({
            response,
            status: Status.COMPLETE,
        });
    });

    it('utils - getProtocol', () => {
        expect(getProtocol('https://github.com')).toBe('https');
        expect(getProtocol('http://github.com')).toBe('http');
    });
});
