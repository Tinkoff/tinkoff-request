/**
 * @jest-environment node
 */

import { addQuery, serialize } from './url';

describe('plugins/http/url', () => {
    it('should add query to url', () => {
        expect(addQuery('/api', {})).toBe('/api');
        expect(addQuery('/api', { a: '1', b: '2' })).toBe('/api?a=1&b=2');
        expect(addQuery('domain.abv/api', { q: 'test', c: 'test2' })).toBe('domain.abv/api?q=test&c=test2');
        expect(addQuery('https://domain.abv/api/v2/?a=1', { b: '2', c: '3' })).toBe(
            'https://domain.abv/api/v2/?a=1&b=2&c=3'
        );
        expect(addQuery('/api/some/?a=1', { a: '2' })).toBe('/api/some/?a=2');
    });

    it('should serialize passed object', () => {
        expect(serialize({ a: '1', b: '2', c: 'test' })).toBe('a=1&b=2&c=test');
    });
});
