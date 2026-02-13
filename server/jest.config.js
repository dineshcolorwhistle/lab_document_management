module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
    moduleNameMapper: {
        '^uuid$': '<rootDir>/__mocks__/uuid.js',
    },
    verbose: true,
    silent: false,
};
