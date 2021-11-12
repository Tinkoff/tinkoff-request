/**
 * determine how long should we wait for background requests relative to the timeout of the initial request
 */
const BACKGROUND_REQUEST_TIMEOUT_FACTOR = 2;

export const getStaleBackgroundRequestTimeout = (params: { requestTimeout?: number; configTimeout?: number }) => {
    const { requestTimeout, configTimeout } = params;
    if (configTimeout) {
        return configTimeout;
    }

    if (requestTimeout) {
        return requestTimeout * BACKGROUND_REQUEST_TIMEOUT_FACTOR;
    }

    return undefined;
};
