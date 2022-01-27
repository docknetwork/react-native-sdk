import {JSONRPCServer} from 'json-rpc-2.0';
import {
  createRpcService,
  patchRpcServer,
} from '@docknetwork/wallet-sdk-core/lib/rpc-util';
import storageService from './async-storage-service';
import logger from './logger';

const rpcServer = new JSONRPCServer();

patchRpcServer(rpcServer);

if (process.env.NODE_ENV !== 'test') {
  [storageService, logger].forEach(service => {
    const rpcService = createRpcService(service);
    rpcService.forEach(method => {
      rpcServer.addMethod(method.name, async params => {
        const result = await method.resolver(params);
        return result || {};
      });
    });
  });
}

export default rpcServer;
