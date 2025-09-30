

##

React native doesn't support webassembly, which is heavly used by polkadit-js. All the polkadot-js implemenation needs to run in a webview, and it include some components of the wallet-sdk as well.

The wallet sdk abstracts all the complexity of the webivew commnuication with the react-native thread.

In case you want to have a better understanding on the webview implemenation, it's using a json-rpc client/server to exchange messages between react-native and the webview.


The webview is similar to a rest api, ans its entry point is
@docknetwork/wallet-sdk-core/lib/index.js

The main thread will interact with the services by using the client 
@docknetwork/wallet-sdk-core/lib/client

Notice that the `modules` folder is running in the main thread (react native) and will be using the json rpc client (`@docknetwork/wallet-sdk-core/lib/client`) to interact with `@docknetwork/wallet-sdk-core/lib/service` methods


