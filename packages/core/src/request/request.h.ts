import { Plugin, Request, Response } from '../types.h';

export default interface TinkoffRequest {
    (plugins: Plugin[]) : (request: Request) => Promise<Response>;
}
