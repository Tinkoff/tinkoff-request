import applyOrReturn from '@tinkoff/utils/function/applyOrReturn';
import { Context, Status } from '@tinkoff/request-core';
import batch from './batch';
import { BATCH } from './constants/metaTypes';

const requests = [
    { url: 'first', batchKey: 'test', batchTimeout: 25 },
    { url: 'second', batchKey: 'test' },
    { url: 'third', batchKey: 'test1231452135' },
    { url: 'forth' }
];
const makeGroupedRequest = jest.fn(r => Promise.resolve(r.map(x => x.url)));

describe('plugins/batch', () => {
    let context;

    beforeEach(() => {
        context = new Context();
        context.updateMeta = jest.fn(context.updateMeta.bind(context));
    });

    it('test shouldExecute', () => {
        let shouldExecute = batch({ makeGroupedRequest }).shouldExecute;

        expect(applyOrReturn([context], shouldExecute)).toBeFalsy();
        shouldExecute = batch({ makeGroupedRequest }).shouldExecute;
        expect(applyOrReturn([context], shouldExecute)).toBeFalsy();

        context.setState({
            request: {
                batchKey: '123'
            }
        });

        expect(applyOrReturn([context], shouldExecute)).toBeTruthy();
    });

    it('test init with batch requests', () => { // eslint-disable-line max-statements
        const init = batch({ makeGroupedRequest, timeout: 123 }).init;
        const next = jest.fn();

        context.setState({ request: requests[0] });
        init(context, next, null);
        expect(context.updateMeta).toHaveBeenLastCalledWith(BATCH, { batched: true });
        expect(next).not.toHaveBeenCalled();
        expect(makeGroupedRequest).not.toHaveBeenCalled();

        context.setState({ request: requests[1] });
        init(context, next, null);
        context.setState({ request: requests[2] });
        init(context, next, null);
        expect(next).not.toHaveBeenCalled();
        context.setState({ request: requests[3] });
        init(context, next, null);
        expect(makeGroupedRequest).not.toHaveBeenCalled();

        jest.runAllTimers();
        expect(makeGroupedRequest).toHaveBeenCalledWith([requests[0], requests[1]]);
        expect(makeGroupedRequest).toHaveBeenCalledWith([requests[2]]);

        expect(next).toHaveBeenCalledTimes(4);
        expect(next).toHaveBeenCalledWith({ status: Status.COMPLETE, response: 'first' });
        expect(next).toHaveBeenCalledWith({ status: Status.COMPLETE, response: 'second' });
        expect(next).toHaveBeenCalledWith({ status: Status.COMPLETE, response: 'third' });
    });

    it('test init with batch requests, but grouped failed', () => {
        const error = new Error('test1213');
        const makeGroupedRequest = () => Promise.reject(error);
        const init = batch({ makeGroupedRequest, timeout: 123 }).init;
        const next = jest.fn();

        context.setState({ request: requests[0] });
        init(context, next, null);
        context.setState({ request: requests[1] });
        init(context, next, null);
        context.setState({ request: requests[2] });
        init(context, next, null);

        jest.runAllTimers();
        expect(next).toHaveBeenCalledTimes(3);
        expect(next).toHaveBeenLastCalledWith({
            error,
            status: Status.ERROR,
        });
    });
});
