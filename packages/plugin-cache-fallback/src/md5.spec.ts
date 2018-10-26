import md5 from './md5';

describe('utils/md5', () => {
    it('test', () => {
        expect(md5('some test string')).toBe('c320d73e0eca9029ab6ab49c99e9795d');
        expect(md5(123)).toBe('202cb962ac59075b964b07152d234b70');
        expect(md5(JSON.stringify({ a: 1, b: 2 }))).toBe('608de49a4600dbb5b173492759792e4a');
        expect(md5(123)).toBe('202cb962ac59075b964b07152d234b70');
    });
});
