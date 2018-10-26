import { Context } from '@tinkoff/request-core';
import url from './url';

const baseUrl = 'global/';
const transform = jest.fn(({ baseUrl, url }) => baseUrl + url);
const plugin = url({ baseUrl, transform });
const next = jest.fn();

describe('plugins/transform/url', () => {
    beforeEach(() => {
        next.mockClear();
    });

    it('baseUrl is not passed', () => {
        const request = { url: 'test12313123/weawe' };
        const context = new Context({ request });

        plugin.init(context, next, null);

        expect(transform).toHaveBeenCalledWith({
            ...request,
            baseUrl
        });
        expect(next).toHaveBeenCalledWith({
            request: {
                ...request,
                url: baseUrl + request.url
            }
        });
    });

    it('baseUrl passed', () => {
        const request = { baseUrl: 'hahah.cm/', url: 'test12313123/weawe' };
        const context = new Context({ request });

        plugin.init(context, next, null);

        expect(transform).toHaveBeenCalledWith(request);
        expect(next).toHaveBeenCalledWith({
            request: {
                ...request,
                url: request.baseUrl + request.url
            }
        });
    });
});
