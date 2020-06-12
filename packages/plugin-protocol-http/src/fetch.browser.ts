// ref: https://github.com/tc39/proposal-global
const getGlobal = function () {
    // the only reliable means to get the global object is
    // `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof glob !== 'undefined') {
        return glob;
    }
    throw new Error('unable to locate global object');
};

const glob = getGlobal();

const fetch = (...args) => {
    return glob.fetch(...args);
};

const { Headers, Request, Response } = glob;

export { fetch, Headers, Request, Response };
