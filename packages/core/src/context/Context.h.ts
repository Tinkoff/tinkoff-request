import Status from '../constants/status';
import { Request, Response } from '../types.h';

export interface ContextState {
    status: Status;
    request: Request;
    response: Response;
    error: Error;
}
