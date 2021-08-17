import { RequestError } from '@tinkoff/request-core';
import { HttpRequestError, TimeoutError, AbortError } from './errors';

export const isHttpError = (error: RequestError): error is HttpRequestError => {
    return error.code === 'ERR_HTTP_ERROR';
};

export const isTimeoutError = (error: RequestError): error is TimeoutError => {
    return error.code === 'ERR_HTTP_REQUEST_TIMEOUT';
};

export const isAbortError = (error: RequestError): error is AbortError => {
    return error.code === 'ABORT_ERR';
};

export const isNetworkFail = (error: RequestError) => {
    return isTimeoutError(error) || (isHttpError(error) && !error.status);
};

export const isServerError = (error: RequestError) => {
    return isHttpError(error) && error.status >= 500;
};
