import { Response } from '@tinkoff/request-core';

export interface CacheDriver {
    get(key: string): Response | Promise<Response>;
    set(key: string, response: Response): void | Promise<void>;
}
