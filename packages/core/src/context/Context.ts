import applyOrReturn from '@tinkoff/utils/function/applyOrReturn';
import Status from '../constants/status';
import { ContextState } from './Context.h';
import { Meta } from '../types.h';

export default class Context {
    private state: ContextState;
    private internalMeta: Meta;
    private externalMeta: Meta;

    constructor(initialState?: Partial<ContextState>) {
        this.state = {
            status: Status.INIT,
            request: null,
            response: null,
            error: null,
            ...initialState,
        };
        this.internalMeta = {};
        this.externalMeta = {};
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

    getInternalMeta(metaName?: string) {
        return this.getMeta(metaName, this.internalMeta);
    }

    getExternalMeta(metaName?: string) {
        return this.getMeta(metaName, this.externalMeta);
    }

    updateInternalMeta(metaName: string, value: Record<string, any>) {
        this.internalMeta = this.extendMeta(metaName, value, this.internalMeta);
    }

    updateExternalMeta(metaName: string, value: Record<string, any>) {
        this.externalMeta = this.extendMeta(metaName, value, this.externalMeta);
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

    private getMeta(metaName?: string, meta: Meta = this.externalMeta) {
        if (metaName) {
            return meta[metaName];
        }

        return meta;
    }

    private extendMeta(metaName: string, value: Record<string, any>, meta: Meta = this.externalMeta) {
        if (!value) {
            return;
        }

        return {
            ...meta,
            [metaName]: {
                ...meta[metaName],
                ...value,
            },
        };
    }
}
