import prop from '@tinkoff/utils/object/prop';
import propOr from '@tinkoff/utils/object/propOr';
import propEq from '@tinkoff/utils/object/propEq';
import isUndefined from '@tinkoff/utils/is/undefined';
import { Context, Status } from '@tinkoff/request-core';

export default (name: string, dflt: boolean) => (context: Context) => {
    const request = context.getRequest();
    const forced = prop('cacheForce', request);
    const forcedSpecific = prop(`${name}CacheForce`, request);
    const isComplete = context.getStatus() === Status.COMPLETE;

    if (forcedSpecific) {
        return isComplete;
    }

    if (isUndefined(forcedSpecific) && forced) {
        return isComplete && dflt;
    }

    const cacheDisabled = propEq('cache', false, request);

    return propOr(`${name}Cache`, cacheDisabled ? false : dflt, request);
};
