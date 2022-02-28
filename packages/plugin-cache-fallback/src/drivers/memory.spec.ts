import { driver as memoryCacheDriver } from './memory';

describe('plugins/cache/fallback/drivers/memory', () => {
    describe('default options', () => {
        it('should read/write from lruCache', () => {
            const driver = memoryCacheDriver();

            expect(driver.get('test')).toBeUndefined();
            expect(driver.set('test', { a: 1 })).toBeUndefined();
            expect(driver.get('test')).toEqual({ a: 1 });
        });
    });
});
