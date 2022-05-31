/**
 * @jest-environment node
 */

import { addQuery, normalizeUrl, serialize } from './url';

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

    it('should serialize passed object', () => {
        expect(serialize({ a: '1', b: '2', c: 'test' })).toBe('a=1&b=2&c=test');
        expect(serialize({ a: '', b: undefined, c: null, d: 0 })).toBe('a=&d=0');
        expect(serialize({ a: '1', b: { c: '2', d: null, e: { f: '3' } }, g: 'test' })).toBe('a=1&b%5Bc%5D=2&b%5Be%5D%5Bf%5D=3&g=test');
    });

    it('should add default http protocol for requests on server', () => {
        expect(normalizeUrl('static.com/test.js')).toEqual('http://static.com/test.js');
        expect(normalizeUrl('https://static.com/test.js')).toBe('https://static.com/test.js');
    });
});
