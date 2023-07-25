import {getRpcClient, initRpcClient} from './rpc-client';
import rpcServer from './rpc-server';
import {setStorage} from './core/storage';
import Realm from 'realm';
import {setRealmInstance} from './core/realm';

setRealmInstance(Realm);

setStorage(global.localStorage);

initRpcClient(req => {
  return rpcServer.receive(req).then(result => {
    getRpcClient().receive(result);
    return result;
  });
});
