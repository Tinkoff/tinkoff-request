import { RequestError, RequestErrorCode } from '@tinkoff/request-core';

export class TimeoutError extends Error implements RequestError {
    code: RequestErrorCode['ERR_HTTP_REQUEST_TIMEOUT'] = 'ERR_HTTP_REQUEST_TIMEOUT';

    message = 'Request timed out';
}

export class HttpRequestError extends Error implements RequestError {
    code: RequestErrorCode['ERR_HTTP_ERROR'] = 'ERR_HTTP_ERROR';

    status: number;

    body: any;
}

export class AbortError extends Error implements RequestError {
    code: RequestErrorCode['ABORT_ERR'] = 'ABORT_ERR';
}
