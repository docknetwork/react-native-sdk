module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    "react-native/no-inline-styles": 0,
  },
  globals: {
    Buffer: true
  },
  env: {
    "jest/globals": true,
    "browser": true
  }
};
