/**
 * @jest-environment node
 */
import { MakeRequestResult } from '@tinkoff/request-core';
import { Headers } from './fetch';
import { PROTOCOL_HTTP } from './constants';
import { abort, getHeader, getHeaders, getStatus } from './utils';

const headers = new Headers({
    a: 'aaa',
    b: 'bbb',
});

headers.append('set-cookie', 'cookie1');
headers.append('set-cookie', 'cookie2');

describe('plugins/http/utils', () => {
    const requestAbort = jest.fn();
    const response = {
        headers,
        status: 202,
    };
    let result: MakeRequestResult;

    beforeEach(() => {
        result = {
            getState: jest.fn(),
            getInternalMeta: jest.fn(() => {
                return {
                    requestAbort,
                    response,
                };
            }),
        } as any;
    });

    it('get headers', () => {
        expect(getHeaders(result)).toEqual({ a: 'aaa', b: 'bbb', 'set-cookie': ['cookie1', 'cookie2'] });
        expect(result.getInternalMeta).toHaveBeenCalledWith(PROTOCOL_HTTP);
    });

    it('get header', () => {
        expect(getHeader(result, 'a')).toBe('aaa');
        expect(getHeader(result, 'b')).toBe('bbb');
        expect(getHeader(result, 'c')).toBeNull();
        expect(getHeader(result, 'set-cookie')).toEqual(['cookie1', 'cookie2']);
    });

    it('get status', () => {
        expect(getStatus(result)).toEqual(202);
    });

    it('abort request', () => {
        expect(requestAbort).not.toHaveBeenCalled();
        abort(result);
        expect(requestAbort).toHaveBeenCalled();
    });
});
