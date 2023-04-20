module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {
    '^.+\\.(ts|js)$': 'babel-jest',
  },
  resetMocks: false,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFiles: ['jest-localstorage-mock'],
  moduleNameMapper: {},
  transformIgnorePatterns: ['/node_modules/(?!@polkadot|@babel|@docknetwork)'],
};
