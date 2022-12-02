import {RpcService} from '../rpc-service-client';
import {
  GetMessageParams,
  SendMessageParams,
  serviceName,
  validation,
} from './configs';

export class RelayServiceRpc extends RpcService {
  constructor() {
    super(serviceName);
  }

  sendMessage(params: SendMessageParams) {
    validation.sendMessage(params);
    return this.call('sendMessage', params);
  }

  getMessages(params: GetMessageParams) {
    validation.getMessages(params);
    return this.call('getMessages', params);
  }
}
