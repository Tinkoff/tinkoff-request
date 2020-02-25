import { getStatus } from '@tinkoff/request-plugin-protocol-http';
import metricsPlugin from './metrics';

const getHttpLabelsValues = (context) => {
    const { request: { url = 'unknown', httpMethod = 'GET' } = {} } = context.getState() || {};

    return {
        method: httpMethod.toUpperCase(),
        url,
        status: getStatus(context as any) || 'unknown',
    };
};
const httpLabels = ['method', 'url', 'status']

export default (opts) => metricsPlugin(Object.assign({
    labelNames: httpLabels,
    getLabelsValuesFromContext:  getHttpLabelsValues,
}, opts));
