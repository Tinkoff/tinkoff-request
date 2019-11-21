import { serialize } from './serialize';

describe('plugins/http/serialize', () => {
    it('should encode query url if type is form', () => {
        const payload = { a: 1, b: 2, c: 'abc' };

        expect(serialize('form', payload)).toMatchInlineSnapshot(`"a=1&b=2&c=abc"`);
        expect(serialize('urlencoded', payload)).toMatchInlineSnapshot(`"a=1&b=2&c=abc"`);
        expect(serialize('form-data', payload)).toMatchInlineSnapshot(`"a=1&b=2&c=abc"`);
    });

    it('should converst to json', () => {
        const payload = { a: 1, b: 2, c: 'abc' };

        expect(serialize('json', payload)).toMatchInlineSnapshot(`"{\\"a\\":1,\\"b\\":2,\\"c\\":\\"abc\\"}"`);
    });

    it('should return payload as is otherwise', () => {
        const payload = { a: 1, b: 2, c: 'abc' };

        expect(serialize('multipart/form-data', payload)).toBe(payload);
        expect(serialize('unknown', payload)).toBe(payload);
        expect(serialize('html', payload)).toBe(payload);
    });
});
