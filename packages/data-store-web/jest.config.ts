module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  testMatch: [
    "<rootDir>/src/**/!(*.e2e).test.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  resetMocks: false,
  setupFiles: ['jest-localstorage-mock'],
};
