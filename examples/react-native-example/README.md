# Wallet SDK Demo
React-native project running the Truvera wallet-sdk

# Installation

```bash
# make sure you are using the supported nodejs version
nvm use 16.14.0
# Clone wallet-sdk repository
git clone git@github.com:docknetwork/react-native-sdk.git ../wallet-sdk
# install dependencies on wallet-sdk repository
cd ../wallet-sdk
yarn install
# navigate again to the sdk-example directory
cd ../wallet-sdk-demo
# install react-native app dependencies
yarn install
# build the wallet-sdk webview
yarn build-sdk
# Only for iOS: install cocoapods dependencies
cd ios
pod install
```


# Running on android
```bash
yarn start
# run the following on another terminal
yarn android
```


# Running on android
```bash
yarn start
# run the following on another terminal
yarn ios
```
