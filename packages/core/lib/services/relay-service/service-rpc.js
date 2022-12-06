import {RpcService} from '../rpc-service-client';
import {
  GetMessagesParams,
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

  getMessages(params: GetMessagesParams) {
    validation.getMessages(params);
    return this.call('getMessages', params);
  }
}
