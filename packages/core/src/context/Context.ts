import applyOrReturn from '@tinkoff/utils/function/applyOrReturn';
import Status from '../constants/status';
import { ContextState } from './Context.h';

export default class Context {
    private state: ContextState;

    constructor(initialState?: Partial<ContextState>) {
        this.state = {
            status: Status.INIT,
            meta: {},
            request: null,
            response: null,
            error: null,
            ...initialState,
        };
    }

    getState() {
        return this.state;
    }

    setState(stateOrFunc: Partial<ContextState>) {
        const newState = applyOrReturn([this.state], stateOrFunc);

        if (newState) {
            this.state = {
                ...this.state,
                ...newState,
            };
        }
    }

    getMeta(metaName: string) {
        return this.state.meta[metaName];
    }

    updateMeta(metaName: string, meta: object) {
        if (!meta) {
            return;
        }

        this.state = {
            ...this.state,
            meta: {
                ...this.state.meta,
                [metaName]: {
                    ...this.state.meta[metaName],
                    ...meta,
                },
            },
        };
    }

    getStatus() {
        return this.state.status;
    }

    getResponse() {
        return this.state.response;
    }

    getRequest() {
        return this.state.request;
    }
}
