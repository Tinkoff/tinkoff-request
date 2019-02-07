import { MakeRequestResult } from '@tinkoff/request-core';
import { PROTOCOL_HTTP } from './constants';
import { abort, getHeader, getHeaders, getStatus, getText } from './utils';

const header = {
    a: 'aaa',
    b: 'bbb',
};

describe('plugins/http/utils', () => {
    let request = {
        abort: jest.fn(),
    };
    let response = {
        header,
        text: 'text123',
        status: 202,
        get: jest.fn((name) => header[name]),
    };
    let result: MakeRequestResult;

    beforeEach(() => {
        result = {
            getState: jest.fn(),
            getMeta: jest.fn(() => {
                return {
                    request,
                    response,
                }
            })
        } as any;
    });

    it('get headers', () => {
        expect(getHeaders(result)).toEqual(header);
        expect(result.getMeta).toHaveBeenCalledWith(PROTOCOL_HTTP);
    });

    it('get header', () => {
        expect(getHeader(result, 'a')).toBe('aaa');
        expect(getHeader(result, 'b')).toBe('bbb');
        expect(getHeader(result, 'c')).toBeUndefined();
        expect(response.get).toHaveBeenCalledWith('a');
        expect(response.get).toHaveBeenCalledWith('b');
        expect(response.get).toHaveBeenCalledWith('c');
        expect(response.get).toHaveBeenCalledTimes(3);
    });

    it('get text', () => {
        expect(getText(result)).toEqual('text123');
    });

    it('get status', () => {
        expect(getStatus(result)).toEqual(202);
    });

    it('abort request', () => {
        expect(request.abort).not.toHaveBeenCalled();
        abort(result);
        expect(request.abort).toHaveBeenCalled();
    });
});
