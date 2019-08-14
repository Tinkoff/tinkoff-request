import { Response } from 'node-fetch';
import parse from './parse';

describe('plugins/http/url', () => {
    it('for application/json should call json() on response', async () => {
        const res = new Response('{"test": 1}', {
            status: 200,
            headers: {
                'Content-type': 'application/json',
            },
        });

        const json = jest.spyOn(res, 'json');
        const text = jest.spyOn(res, 'text');

        expect(await parse(res)).toEqual({ test: 1 });

        expect(json).toHaveBeenCalled();
        expect(text).not.toHaveBeenCalled();
    });

    it('otherwise should call text()', async () => {
        const res = new Response('{"test": 1}', {
            status: 200,
            headers: {},
        });

        const json = jest.spyOn(res, 'json');
        const text = jest.spyOn(res, 'text');

        expect(await parse(res)).toEqual('{"test": 1}');

        expect(json).not.toHaveBeenCalled();
        expect(text).toHaveBeenCalled();
    });
});
