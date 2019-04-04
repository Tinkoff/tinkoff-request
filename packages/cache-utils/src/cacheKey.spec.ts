import cacheKey from './cacheKey';

describe('utils/cacheKey', () => {
    it('test', () => {
        expect(
            cacheKey({
                httpMethod: 'GET',
                url: '/test123',
                payload: { a: 1, b: 2 },
                query: { q: 1, q2: 3 },
                rawQueryString: 'a=b&b=3',
            })
        ).toBe('get/test123{"a":1,"b":2}{"q":1,"q2":3}a=b&b=3""');

        expect(
            cacheKey({
                httpMethod: 'POST',
                url: '/test',
                payload: {},
                query: { q: 6 },
                rawQueryString: 'a=b',
            })
        ).toBe('post/test{}{"q":6}a=b""');

        expect(
            cacheKey({
                httpMethod: 'PUT',
                url: '/test1235353636/tetete',
                query: {},
                rawQueryString: '',
                additionalCacheKey: { a: 5 },
            })
        ).toBe('put/test1235353636/tetete""{}{"a":5}');
    });
});
