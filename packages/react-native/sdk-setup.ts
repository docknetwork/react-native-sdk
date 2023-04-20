import {
  getRpcClient,
  initRpcClient,
} from '@docknetwork/wallet-sdk-core/lib/rpc-client';
import rpcServer from '@docknetwork/wallet-sdk-core/lib/rpc-server';
import {setStorage} from '@docknetwork/wallet-sdk-core/lib/core/storage';

setStorage(global.localStorage);

initRpcClient(req => {
  return rpcServer.receive(req).then(result => {
    getRpcClient().receive(result);
    return result;
  });
});

// Buffer.from('test').toString('base64');

import fetch from 'node-fetch';
