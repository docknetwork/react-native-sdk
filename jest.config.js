
module.exports = {
  "testEnvironment": "node",
  "testTimeout": 30000,
  "transform": {
    "^.+\\.(ts|js)$": "babel-jest"
  },
  "resetMocks": false,
  "setupFilesAfterEnv": [
    "<rootDir>/setup-tests.js",
  ],
  "globalTeardown": './scripts/test-teardown-globals.js',
  "setupFiles": [
    "jest-localstorage-mock"
  ],
  "moduleNameMapper": {},
  "transformIgnorePatterns": [
    "/node_modules/(?!@polkadot|@babel|@docknetwork|@digitalbazaar)",
  ],
}