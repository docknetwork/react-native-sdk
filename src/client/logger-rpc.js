import { getLogger } from "../logger";
import { rpcRequest } from "../rpc-client";

export class LoggerRpc {
  static log(...params) {
    return rpcRequest("logger.log", ...params);
  }
}
