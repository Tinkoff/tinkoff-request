import prop from '@tinkoff/utils/object/prop';
import propOr from '@tinkoff/utils/object/propOr';
import propEq from '@tinkoff/utils/object/propEq';
import isUndefined from '@tinkoff/utils/is/undefined';
import { Context, Status } from '@tinkoff/request-core';
import { CACHE } from './constants/metaTypes';

export default (name: string, dflt: boolean) => (context: Context) => {
    const request = context.getRequest();
    const forced = prop('cacheForce', request);
    const forcedSpecific = prop(`${name}CacheForce`, request);
    const disabled = propEq('cache', false, request);
    const enabledSpecific = propOr(`${name}Cache`, disabled ? false : dflt, request);
    const isComplete = context.getStatus() === Status.COMPLETE;

    if (context.getStatus() === Status.INIT) {
        context.updateExternalMeta(CACHE, {
            forced,
            enabled: !disabled,
            [`${name}Enabled`]: enabledSpecific,
            [`${name}Force`]: forcedSpecific,
        });
    }

    if (forcedSpecific) {
        return isComplete;
    }

    if (isUndefined(forcedSpecific) && forced) {
        return isComplete && dflt;
    }

    return enabledSpecific;
};
