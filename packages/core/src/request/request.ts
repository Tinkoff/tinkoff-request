import applyOrReturn from '@tinkoff/utils/function/applyOrReturn';
import once from '@tinkoff/utils/function/once';
import propOr from '@tinkoff/utils/object/propOr';

import Status from '../constants/status';
import Context from '../context/Context';
import RequestMaker from './request.h';
import { Next, Request } from '../types.h';

const DEFAULT_STATUS_TRANSITION = {
    [Status.INIT]: Status.COMPLETE,
};

const FORWARD = 1;
const BACKWARD = -1;

const requestMaker: RequestMaker = function (plugins) {
    const makeRequest = (request: Request) => {
        let i = -1;
        const len = plugins.length;

        const context = new Context();

        context.setState({ request });

        const promise = new Promise<any>((resolve, reject) => {
            const cb = (statusChanged: boolean) => {
                const state = context.getState();
                const currentStatus = state.status;
                const nextDefaultStatus = DEFAULT_STATUS_TRANSITION[currentStatus];

                if (statusChanged) {
                    return traversePlugins(currentStatus, BACKWARD);
                }

                if (nextDefaultStatus) {
                    context.setState({
                        status: nextDefaultStatus,
                    });
                    return traversePlugins(nextDefaultStatus, BACKWARD);
                }

                if (currentStatus === Status.COMPLETE) {
                    resolve(state.response);
                } else {
                    reject(
                        Object.assign(state.error || {}, {
                            url: state.request.url,
                        })
                    );
                }
            };

            const traversePlugins = (event: Status, direction: number) => {
                const initialStatus = context.getState().status;

                const next: Next = (newState) => {
                    context.setState(newState);
                    const state = context.getState();

                    if (state.status !== initialStatus) {
                        return cb(true);
                    }

                    i += direction;
                    if (i < 0 || i >= len) {
                        return cb(false);
                    }

                    const plugin = plugins[i];
                    const pluginAction = plugin[event];

                    if (!pluginAction || !applyOrReturn([context], propOr('shouldExecute', true, plugin))) {
                        return next();
                    }

                    try {
                        pluginAction(context, once(next), makeRequest);
                    } catch (err) {
                        return next({ status: Status.ERROR, error: err });
                    }
                };

                next(); // with no state
            };

            traversePlugins(Status.INIT, FORWARD);
        });

        return Object.assign(promise, {
            getState: context.getState.bind(context),
            getInternalMeta: context.getInternalMeta.bind(context),
            getExternalMeta: context.getExternalMeta.bind(context),
        });
    };

    return makeRequest;
};

export default requestMaker;
