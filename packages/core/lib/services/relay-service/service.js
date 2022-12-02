import assert from 'assert';
import {
  SendMessageParams,
  GetMessagesParams,
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
}

export {
  relayServiceClient
}

export const relayService: RelayService = new RelayService();
