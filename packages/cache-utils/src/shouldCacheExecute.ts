import prop from '@tinkoff/utils/object/prop';
import { Context, Status } from '@tinkoff/request-core';
import { CACHE } from './constants/metaTypes';

declare module '@tinkoff/request-core/lib/types.h' {
    export interface Request {
        cache?: boolean;
        cacheForce?: boolean;
    }
}

export default (name: string, dflt: boolean) => (context: Context) => {
    const request = context.getRequest();
    const forced = prop('cacheForce', request) ?? false;
    const forcedSpecific = prop(`${name}CacheForce`, request) ?? forced;
    const enabled = prop('cache', request) ?? dflt;
    const enabledSpecific = prop(`${name}Cache`, request) ?? enabled;

    if (context.getStatus() === Status.INIT) {
        context.updateExternalMeta(CACHE, {
            forced,
            enabled,
            [`${name}Enabled`]: enabledSpecific,
            [`${name}Force`]: forcedSpecific,
        });
    }

    if (forcedSpecific) {
        return context.getStatus() === Status.COMPLETE;
    }

    return enabledSpecific;
};
