import path from 'path';
import { readJSON, writeJSON, ensureDirSync } from 'fs-extra';
import fsCacheDriver from './fs';

jest.mock('fs-extra', () => ({
    readJSON: jest.fn(() => Promise.resolve()),
    writeJSON: jest.fn(() => Promise.resolve()),
    ensureDirSync: jest.fn(() => Promise.resolve()),
}));

describe('plugins/cache/fallback/drivers/fs', () => {
    beforeEach(() => {
        (readJSON as jest.Mock).mockClear();
        (writeJSON as jest.Mock).mockClear();
        (ensureDirSync as jest.Mock).mockClear();
    });

    describe('default options', () => {
        it('should create dir', () => {
            fsCacheDriver();

            expect(ensureDirSync).toHaveBeenCalledWith(path.join('.tmp', 'server-cache', 'fallback'));
        });

        it('should read from json', () => {
            const driver = fsCacheDriver();

            (readJSON as jest.Mock).mockImplementation(() => Promise.reject(new Error('not found')));

            expect(driver.get('not-found')).rejects.toThrow('not found');
            expect(readJSON).toHaveBeenCalledWith(path.join('.tmp', 'server-cache', 'fallback', 'not-found.json'));

            expect(driver.get(`some_${Array(100).fill('very').join('_')}_long_name`)).rejects.toThrow('not found');
            expect(readJSON).toHaveBeenCalledWith(
                path.join('.tmp', 'server-cache', 'fallback', '8b4d8b946c24d9a58e670f71f347a8a5.json')
            );

            (readJSON as jest.Mock).mockImplementation(() => Promise.resolve({ a: 1 }));
            expect(driver.get('test')).resolves.toEqual({ a: 1 });
            expect(readJSON).toHaveBeenCalledWith(path.join('.tmp', 'server-cache', 'fallback', 'test.json'));

            (readJSON as jest.Mock).mockImplementation(() => Promise.resolve({ b: 2 }));
            expect(driver.get(`test_${Array(100).fill('very').join('_')}_long_name`)).resolves.toEqual({ b: 2 });
            expect(readJSON).toHaveBeenCalledWith(
                path.join('.tmp', 'server-cache', 'fallback', 'a37958292e5df201bfa3fc54a69962d6.json')
            );
        });

        it('should write to json', () => {
            const driver = fsCacheDriver();

            driver.set('test', { a: 1 });
            expect(writeJSON).toHaveBeenCalledWith(path.join('.tmp', 'server-cache', 'fallback', 'test.json'), {
                a: 1,
            });

            driver.set(`some_${Array(100).fill('very').join('_')}_long_name`, { b: 2 });
            expect(writeJSON).toHaveBeenCalledWith(
                path.join('.tmp', 'server-cache', 'fallback', '8b4d8b946c24d9a58e670f71f347a8a5.json'),
                { b: 2 }
            );

            (writeJSON as jest.Mock).mockImplementation(() => Promise.reject(new Error('test')));

            expect(() => driver.set(`test_${Array(100).fill('very').join('_')}_long_name`, { c: 3 })).not.toThrow();
            expect(writeJSON).toHaveBeenCalledWith(
                path.join('.tmp', 'server-cache', 'fallback', 'a37958292e5df201bfa3fc54a69962d6.json'),
                { c: 3 }
            );
        });
    });

    describe('override options', () => {
        it('should create dir', () => {
            fsCacheDriver({ basePath: '.cache', name: 'test' });

            expect(ensureDirSync).toHaveBeenCalledWith(path.join('.cache', 'test'));
        });

        it('should read from json', () => {
            const driver = fsCacheDriver({ basePath: 'tmp' });

            (readJSON as jest.Mock).mockImplementation(() => Promise.reject(new Error('not found')));

            expect(driver.get('not-found')).rejects.toThrow('not found');
            expect(readJSON).toHaveBeenCalledWith(path.join('tmp', 'fallback', 'not-found.json'));

            expect(driver.get(`some_${Array(100).fill('very').join('_')}_long_name`)).rejects.toThrow('not found');
            expect(readJSON).toHaveBeenCalledWith(
                path.join('tmp', 'fallback', '8b4d8b946c24d9a58e670f71f347a8a5.json')
            );

            (readJSON as jest.Mock).mockImplementation(() => Promise.resolve({ a: 1 }));
            expect(driver.get('test')).resolves.toEqual({ a: 1 });
            expect(readJSON).toHaveBeenCalledWith(path.join('tmp', 'fallback', 'test.json'));

            (readJSON as jest.Mock).mockImplementation(() => Promise.resolve({ b: 2 }));
            expect(driver.get(`test_${Array(100).fill('very').join('_')}_long_name`)).resolves.toEqual({ b: 2 });
            expect(readJSON).toHaveBeenCalledWith(
                path.join('tmp', 'fallback', 'a37958292e5df201bfa3fc54a69962d6.json')
            );
        });

        it('should write to json', () => {
            const driver = fsCacheDriver({ name: 'test' });

            driver.set('test', { a: 1 });
            expect(writeJSON).toHaveBeenCalledWith(path.join('.tmp', 'server-cache', 'test', 'test.json'), {
                a: 1,
            });

            driver.set(`some_${Array(100).fill('very').join('_')}_long_name`, { b: 2 });
            expect(writeJSON).toHaveBeenCalledWith(
                path.join('.tmp', 'server-cache', 'test', '8b4d8b946c24d9a58e670f71f347a8a5.json'),
                { b: 2 }
            );

            (writeJSON as jest.Mock).mockImplementation(() => Promise.reject(new Error('test')));

            expect(() => driver.set(`test_${Array(100).fill('very').join('_')}_long_name`, { c: 3 })).not.toThrow();
            expect(writeJSON).toHaveBeenCalledWith(
                path.join('.tmp', 'server-cache', 'test', 'a37958292e5df201bfa3fc54a69962d6.json'),
                { c: 3 }
            );
        });
    });
});
