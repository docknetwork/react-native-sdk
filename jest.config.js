
module.exports = {
  "testEnvironment": "node",
  "testTimeout": 30000,
  "transform": {
    "^.+\\.(ts|js)$": "babel-jest"
  },
  "setupFilesAfterEnv": ["./src/setupTests.js"],
  "resetMocks": false,
  "setupFiles": ["jest-localstorage-mock"],
  "moduleNameMapper": {},
  "transformIgnorePatterns": [
    "/node_modules/(?!@polkadot|@babel)",
  ],
}