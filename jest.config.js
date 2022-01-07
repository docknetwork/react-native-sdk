
module.exports = {
  "testEnvironment": "node",
  "testTimeout": 30000,
  "transform": {
    "^.+\\.(ts|js)$": "babel-jest"
  },
  "setupFilesAfterEnv": ["./src/setupTests.js"],
  "resetMocks": false,
  "setupFiles": ["jest-localstorage-mock"],
  "moduleNameMapper": {
    // "@docknetwork/sdk": "<rootDir>/node_modules/@docknetwork/sdk/index.js",
    // "@docknetwork/sdk/resolver": "<rootDir>/node_modules/@docknetwork/sdk/resolver.js"
    
  },
  "transformIgnorePatterns": [
    "/node_modules/(?!@polkadot|@babel|@docknetwork)",
    // @docknetwork/wallet
    // "node_modules/(?!(@polkadot"
    //   + "|react-navigation-tabs"
    //   + "|react-native-splash-screen"
    //   + "|react-native-screens"
    //   + "|react-native-reanimated"
    // + ")/)",
  ],
}