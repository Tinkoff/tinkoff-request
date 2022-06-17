/**
 * @jest-environment jsdom
 */
import { Context } from '@tinkoff/request-core';
import jsonp from './jsonp';

const mockJsonp = jest.fn((...args) => Promise.resolve());
jest.mock(
    'fetch-jsonp',
    () =>
        (...args) =>
            mockJsonp(...args)
);

const plugin = jsonp();
const next = jest.fn();

describe('plugins/jsonp', () => {
    beforeEach(() => {
        mockJsonp.mockClear();
        next.mockClear();
    });

    it('test jsonp option', async () => {
        const jsonpObject = {};

        plugin.init!(
            new Context({
                request: {
                    url: 'test',
                    jsonp: jsonpObject,
                },
            }),
            next,
            null as any
        );

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockJsonp).toBeCalledWith('test', jsonpObject);
    });

    it('test with custom querySerializer', async () => {
        const mockQuerySerializer = jest.fn(() => 'query-string');

        const plugin = jsonp({}, { querySerializer: mockQuerySerializer });

        plugin.init!(
            new Context({ request: { url: 'http://test.com/api?test=123', query: { a: '1' } } }),
            next,
            null as any
        );

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockQuerySerializer).toHaveBeenCalledWith({ a: '1' }, 'test=123');
    });
});
