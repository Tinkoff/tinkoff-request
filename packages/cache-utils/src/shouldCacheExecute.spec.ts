import { Context, Status } from '@tinkoff/request-core';
import shouldCacheExecute from './shouldCacheExecute';

const generate = (request, status = Status.INIT) => new Context({ status, request });

describe('utils/shouldCacheExecute', () => {
    describe('default is false', () => {
        const isActive = shouldCacheExecute('test', false);

        it('testCache option', () => {
            expect(isActive(generate({ randomCache: false }))).toBe(false);
            expect(isActive(generate({ testCache: false }))).toBe(false);
            expect(isActive(generate({ testCache: true }))).toBe(true);
        });

        it('testCacheForce is set', () => {
            expect(isActive(generate({ testCacheForce: false }))).toBe(false);
            expect(isActive(generate({ testCacheForce: true }))).toBe(false);
        });

        it('on complete requests check testCacheForce', () => {
            expect(isActive(generate({}, Status.COMPLETE))).toBe(false);
            expect(isActive(generate({ testCacheForce: true }, Status.COMPLETE))).toBe(true);
        });

        it('test common option `cache`', () => {
            expect(isActive(generate({ cache: true }))).toBe(true);
            expect(isActive(generate({ cache: false }))).toBe(false);
            expect(isActive(generate({ cache: true, testCache: false }))).toBe(false);
            expect(isActive(generate({ cache: true, testCache: true }))).toBe(true);
            expect(isActive(generate({ cache: false, testCache: false }))).toBe(false);
            expect(isActive(generate({ cache: false, testCache: true }))).toBe(true);
        });

        it('test common option `cacheForce`', () => {
            expect(isActive(generate({ cache: false, cacheForce: true }))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: false }))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: false, testCacheForce: false }))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: false, testCacheForce: true }))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: true, testCacheForce: false }))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: true, testCacheForce: true }))).toBe(false);
        });

        it('test common option `cacheForce` complete state', () => {
            expect(isActive(generate({ cache: false, cacheForce: true }, Status.COMPLETE))).toBe(true);
            expect(isActive(generate({ cache: false, cacheForce: false }, Status.COMPLETE))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: false, testCacheForce: false }, Status.COMPLETE))).toBe(
                false
            );
            expect(isActive(generate({ cache: false, cacheForce: false, testCacheForce: true }, Status.COMPLETE))).toBe(
                true
            );
            expect(isActive(generate({ cache: false, cacheForce: true, testCacheForce: false }, Status.COMPLETE))).toBe(
                false
            );
            expect(isActive(generate({ cache: false, cacheForce: true, testCacheForce: true }, Status.COMPLETE))).toBe(
                true
            );
        });
    });

    describe('default is true', () => {
        const isActive = shouldCacheExecute('test', true);

        it('testCache option', () => {
            expect(isActive(generate({ randomCache: false }))).toBe(true);
            expect(isActive(generate({ testCache: false }))).toBe(false);
            expect(isActive(generate({ testCache: true }))).toBe(true);
        });

        it('testCacheForce is set', () => {
            expect(isActive(generate({ testCacheForce: false }))).toBe(true);
            expect(isActive(generate({ testCacheForce: true }))).toBe(false);
        });

        it('on complete requests check testCacheForce', () => {
            expect(isActive(generate({}, Status.COMPLETE))).toBe(true);
            expect(isActive(generate({ testCacheForce: true }, Status.COMPLETE))).toBe(true);
        });

        it('test common option `cache`', () => {
            expect(isActive(generate({ cache: true }))).toBe(true);
            expect(isActive(generate({ cache: false }))).toBe(false);
            expect(isActive(generate({ cache: true, testCache: false }))).toBe(false);
            expect(isActive(generate({ cache: true, testCache: true }))).toBe(true);
            expect(isActive(generate({ cache: false, testCache: false }))).toBe(false);
            expect(isActive(generate({ cache: false, testCache: true }))).toBe(true);
        });

        it('test common option `cacheForce`', () => {
            expect(isActive(generate({ cache: false, cacheForce: true }))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: false }))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: false, testCacheForce: false }))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: false, testCacheForce: true }))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: true, testCacheForce: false }))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: true, testCacheForce: true }))).toBe(false);
        });

        it('test common option `cacheForce` complete state', () => {
            expect(isActive(generate({ cache: false, cacheForce: true }, Status.COMPLETE))).toBe(true);
            expect(isActive(generate({ cache: false, cacheForce: false }, Status.COMPLETE))).toBe(false);
            expect(isActive(generate({ cache: false, cacheForce: false, testCacheForce: false }, Status.COMPLETE))).toBe(
                false
            );
            expect(isActive(generate({ cache: false, cacheForce: false, testCacheForce: true }, Status.COMPLETE))).toBe(
                true
            );
            expect(isActive(generate({ cache: false, cacheForce: true, testCacheForce: false }, Status.COMPLETE))).toBe(
                false
            );
            expect(isActive(generate({ cache: false, cacheForce: true, testCacheForce: true }, Status.COMPLETE))).toBe(
                true
            );
        });
    });
});
