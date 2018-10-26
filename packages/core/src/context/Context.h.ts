import Status from '../constants/status';
import { Meta, Request, Response } from '../types.h';

export interface ContextState {
    status: Status;
    meta: Meta;
    request: Request;
    response: Response;
    error: Error;
}
