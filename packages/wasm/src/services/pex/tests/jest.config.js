module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  transform: {
    '^.+\\.(js|jsx)$': [
      'babel-jest',
      {
        configFile: require.resolve('../../../../babel.config.js'),
      },
    ],
  },
  resetMocks: false,
};
