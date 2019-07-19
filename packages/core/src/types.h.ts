import httpMethods from './constants/httpMethods';
import { ContextState } from './context/Context.h';
import Context from './context/Context';

export type Meta = Record<string, any>;

export interface Request {
    url: string;
    httpMethod?: httpMethods | keyof typeof httpMethods;
    payload?: any;
    query?: any;
    rawQueryString?: string;
    additionalCacheKey?: any;
    [key: string]: any;
}

export interface Response {}

export interface Next {
    (newState?: Partial<ContextState>): void;
}

export interface MakeRequestResult extends Promise<Response> {
    getState: () => ContextState;
    getInternalMeta: Context['getInternalMeta'];
    getExternalMeta: Context['getExternalMeta'];
}

export interface MakeRequest {
    (request: Request): MakeRequestResult;
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
