import {RpcService} from '../rpc-service-client';
import {
  GetMessagesParams,
  SendMessageParams,
  RegisterDIDPushNotificationParams,
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

  registerDIDPushNotification(params: RegisterDIDPushNotificationParams) {
    validation.registerDIDPushNotification(params);
    return this.call('registerDIDPushNotification', params);
  }
}
