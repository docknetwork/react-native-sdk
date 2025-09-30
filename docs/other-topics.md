# Other Topics

## Using WebAssembly

React native doesn't support WebAssembly. Libraries that require WebAssembly need to run in a WebView. This includes some components of the wallet-sdk. Messages are exchanged with the React Native thread through a JSON RPC client / server layer. The Wallet SDK can be used to abstract all the complexity of the WebView communication with the react-native thread.

The webview is similar to a rest api, and its entry point is
@docknetwork/wallet-sdk-core/lib/index.js

The main thread will interact with the services by using the client 
@docknetwork/wallet-sdk-core/lib/client

Notice that the `modules` folder is running in the main thread (react native) and will be using the json rpc client (`@docknetwork/wallet-sdk-core/lib/client`) to interact with `@docknetwork/wallet-sdk-core/lib/service` methods


