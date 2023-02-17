import {
  SendMessageParams,
  GetMessagesParams,
  RegisterDIDPushNotificationParams,
  serviceName,
  validation,
} from './configs';

import {RelayService as relayServiceClient} from '@docknetwork/wallet-sdk-relay-service/lib';

/**
 * RelayService
 */
export class RelayService {
  rpcMethods = [
    RelayService.prototype.getMessages,
    RelayService.prototype.sendMessage,
    RelayService.prototype.registerDIDPushNotification,
  ];

  constructor() {
    this.name = serviceName;
  }

  sendMessage(params: SendMessageParams) {
    validation.sendMessage(params);
    return relayServiceClient.sendMessage(params);
  }

  getMessages(params: GetMessagesParams) {
    validation.getMessages(params);
    return relayServiceClient.getMessages(params);
  }

  registerDIDPushNotification(params: RegisterDIDPushNotificationParams) {
    validation.registerDIDPushNotification(params);
    return relayServiceClient.registerDIDPushNotification(params);
  }
}

export {relayServiceClient};

export const relayService: RelayService = new RelayService();
