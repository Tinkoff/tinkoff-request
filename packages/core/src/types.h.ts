import { ContextState } from './context/Context.h';
import Context from './context/Context';

export type Meta = Record<string, any>;

export interface RequestErrorCode {}

export interface RequestError extends Error {
    code?: keyof RequestErrorCode;
    message: string;
    [key: string]: any;
}

export interface Request {
    [key: string]: any;
}

export interface Response {}

export interface Next {
    (newState?: Partial<ContextState>): void;
}

export interface MakeRequestResult<T extends Response = any> extends Promise<T> {
    getState: () => ContextState;
    getInternalMeta: Context['getInternalMeta'];
    getExternalMeta: Context['getExternalMeta'];
}

export interface MakeRequest {
    <T = any>(request: Request): MakeRequestResult<T>;
}

export interface Handler {
    (context: Context, next: Next, makeRequest: MakeRequest): void;
}

export interface Plugin {
    init?: Handler;
    complete?: Handler;
    error?: Handler;
    shouldExecute?: (context: Context) => boolean;
}

export { ContextState };
