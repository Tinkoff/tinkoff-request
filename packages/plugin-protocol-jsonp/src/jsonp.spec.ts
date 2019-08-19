import { Context } from '@tinkoff/request-core';
import jsonp from './jsonp';

const mockJsonp = jest.fn((...args) => Promise.resolve());
jest.mock('fetch-jsonp', () => (...args) => mockJsonp(...args));

const plugin = jsonp();
const next = jest.fn();

describe('plugins/jsonp', () => {
    beforeEach(() => {
        mockJsonp.mockClear();
        next.mockClear();
    });

    it('test jsonp option', async () => {
        const jsonpObject = {};

        plugin.init(
            new Context({
                request: {
                    url: 'test',
                    jsonp: jsonpObject,
                },
            }),
            next,
            null
        );

        await new Promise((res) => {
            next.mockImplementation(res);
        });

        expect(mockJsonp).toBeCalledWith('test', jsonpObject);
    });
});
