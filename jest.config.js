module.exports = {
    timers: 'legacy',
    testURL: 'http://localhost/',
    transform: {
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.js$': 'babel-jest',
    },
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json',
        },
    },
    coveragePathIgnorePatterns: ['/node_modules/', '/lib/'],
    testMatch: ['**/*.spec.(ts|js)'],
    moduleFileExtensions: ['ts', 'js'],
    setupFiles: ['jest-date-mock'],
};
