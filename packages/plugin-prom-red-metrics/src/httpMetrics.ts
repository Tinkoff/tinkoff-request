import { getStatus } from '@tinkoff/request-plugin-protocol-http';
import metricsPlugin from './metrics';

export const getHttpLabelsValues = (context) => {
    const { url = 'unknown', httpMethod = 'GET' } = context.getRequest() || {};

    return {
        method: httpMethod.toUpperCase(),
        url,
        status: getStatus(context as any) || 'unknown',
    };
};
export const httpLabels = ['method', 'url', 'status']

export default (opts) => metricsPlugin(Object.assign({
    labelNames: httpLabels,
    getLabelsValuesFromContext:  getHttpLabelsValues,
}, opts));
