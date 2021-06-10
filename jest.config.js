
module.exports = {
  "testEnvironment": "node",
  "testTimeout": 30000,
  "transform": {
    "^.+\\.(ts|js)$": "babel-jest"
  },
  "setupFilesAfterEnv": ["./src/setupTests.js"],
  
  transformIgnorePatterns: [
    "/node_modules/(?!@polkadot|@babel)"
    // "node_modules/(?!(@polkadot"
    //   + "|react-navigation-tabs"
    //   + "|react-native-splash-screen"
    //   + "|react-native-screens"
    //   + "|react-native-reanimated"
    // + ")/)",
  ],
}