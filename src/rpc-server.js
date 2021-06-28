import { JSONRPCServer } from "json-rpc-2.0";
import { createRpcService } from "./rpc-util";
import services from './services';

const rpcServer = new JSONRPCServer();

services.forEach((service) => {
  const rpcService = createRpcService(service);

  rpcService.forEach((method) => {
    rpcServer.addMethod(method.name, (params) => {
      return Promise.resolve(method.resolver(params));
    });
  });
});

export default rpcServer;
