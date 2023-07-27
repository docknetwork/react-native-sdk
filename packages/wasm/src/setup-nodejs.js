import {LocalStorage} from 'node-localstorage';
import {getRpcClient, initRpcClient} from './rpc-client';
import rpcServer from './rpc-server';

global.localStorage = new LocalStorage('./local-storage');

initRpcClient(req => {
  return rpcServer.receive(req).then(result => {
    getRpcClient().receive(result);

    return result;
  });
});
