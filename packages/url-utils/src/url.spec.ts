/**
 * @jest-environment node
 */

import { addQuery, normalizeUrl, serializeQuery } from './url';

describe('plugins/http/url', () => {
    it('should add query to url', () => {
        expect(addQuery('/api', {})).toBe('/api');
        expect(addQuery('/api', { a: '1', b: '2' })).toBe('/api?a=1&b=2');
        expect(addQuery('domain.abv/api', { q: 'test', c: 'test2' })).toBe('domain.abv/api?q=test&c=test2');
        expect(addQuery('https://domain.abv/api/v2/?a=1', { b: '2', c: '3' })).toBe(
            'https://domain.abv/api/v2/?a=1&b=2&c=3'
        );
        expect(addQuery('/api/some/?a=1', { a: '2', b: undefined })).toBe('/api/some/?a=2');
    });

    it('should use customSerializer', () => {
        const serializer = jest.fn(() => 'query=string');

        expect(addQuery('/test?initial=str', { a: '1', b: '2' }, serializer)).toBe('/test?query=string');
        expect(serializer).toHaveBeenCalledWith(
            {
                a: '1',
                b: '2',
            },
            'initial=str'
        );
    });

    it('should serialize query', () => {
        expect(serializeQuery({ a: '1', b: '2', c: 'test' })).toBe('a=1&b=2&c=test');
        expect(serializeQuery({ a: '', b: undefined, c: null, d: '0' })).toBe('a=&d=0');
        expect(serializeQuery({ arr: ['1', '2', '3'] })).toBe('arr%5B0%5D=1&arr%5B1%5D=2&arr%5B2%5D=3');
        expect(serializeQuery({ a: '1', b: { c: '2', d: null, e: { f: '3' } }, g: 'test' })).toBe(
            'a=1&b%5Bc%5D=2&b%5Be%5D%5Bf%5D=3&g=test'
        );
    });

    it('should add default http protocol for requests on server', () => {
        expect(normalizeUrl('static.com/test.js')).toEqual('http://static.com/test.js');
        expect(normalizeUrl('https://static.com/test.js')).toBe('https://static.com/test.js');
    });
});
