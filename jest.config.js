module.exports = {
    timers: 'fake',
    testURL: 'http://localhost/',
    transform: {
        "^.+\\.ts$": "ts-jest",
        "^.+\\.js$": "babel-jest",
    },
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.json"
        }
    },
    coveragePathIgnorePatterns: ["/node_modules/", "/lib/"],
    testMatch: [
        "**/*.spec.(ts|js)"
    ],
    "moduleFileExtensions": [
        "ts",
        "js"
    ]
};
