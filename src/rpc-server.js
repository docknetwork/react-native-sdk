import { JSONRPCServer } from "json-rpc-2.0";
import RpcMethods from "./rpc-methods";

export const rpcServer = new JSONRPCServer();

RpcMethods.forEach((method) => {
  rpcServer.addMethod(method.name, (params) => {
    return method.resolver(params);
  });
});


console.log(RpcMethods);
