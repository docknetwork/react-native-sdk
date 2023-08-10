import {
  getRpcClient,
  initRpcClient,
} from '@docknetwork/wallet-sdk-wasm/src/rpc-client';
import rpcServer from '@docknetwork/wallet-sdk-wasm/src/rpc-server';
import {setStorage} from '@docknetwork/wallet-sdk-wasm/src/core/storage';

setStorage(global.localStorage);

initRpcClient(req => {
  return rpcServer.receive(req).then(result => {
    getRpcClient().receive(result);
    return result;
  });
});
