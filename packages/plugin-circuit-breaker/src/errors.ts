import { RequestError, RequestErrorCode } from '@tinkoff/request-core';

export class CircuitBreakerError extends Error implements RequestError {
    code: RequestErrorCode['ERR_CIRCUIT_BREAKER_OPEN'] = 'ERR_CIRCUIT_BREAKER_OPEN';

    constructor(public lastError: Error) {
        super('Circuit Breaker has blocked request');
    }
}
