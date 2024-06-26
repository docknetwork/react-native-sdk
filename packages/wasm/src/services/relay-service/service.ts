import {
  SendMessageParams,
  GetMessagesParams,
  ResolveDidcommMessageParams,
  RegisterDIDPushNotificationParams,
  serviceName,
  validation,
  AckMessagesParams,
} from './configs';

import {RelayService as relayServiceClient} from '@docknetwork/wallet-sdk-relay-service/src';

/**
 * RelayService
 */
export class RelayService {
  name: string;

  rpcMethods = [
    RelayService.prototype.ackMessages,
    RelayService.prototype.getMessages,
    RelayService.prototype.registerDIDPushNotification,
    RelayService.prototype.resolveDidcommMessage,
    RelayService.prototype.sendMessage,
    RelayService.prototype.signJwt,
  ];

  constructor() {
    this.name = serviceName;
  }

  sendMessage(params: SendMessageParams) {
    validation.sendMessage(params);
    return relayServiceClient.sendMessage(params as any);
  }

  ackMessages(params: AckMessagesParams) {
    return relayServiceClient.ackMessages(params);
  }

  resolveDidcommMessage(params: ResolveDidcommMessageParams) {
    validation.resolveDidcommMessage(params);
    return relayServiceClient.resolveDidcommMessage(params);
  }

  signJwt(params: ResolveDidcommMessageParams) {
    validation.signJwt(params);
    return relayServiceClient.signJwt(params);
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
