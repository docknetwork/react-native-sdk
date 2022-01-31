import {getRpcClient, initRpcClient} from './rpc-client';
import rpcServer from './rpc-server';

initRpcClient(req => {
  return rpcServer.receive(req).then(result => {
    getRpcClient().receive(result);

    return result;
  });
});
