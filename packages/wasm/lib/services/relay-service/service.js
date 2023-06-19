import {
  SendMessageParams,
  GetMessagesParams,
  ResolveDidcommMessageParams,
  RegisterDIDPushNotificationParams,
  serviceName,
  validation,
} from './configs';
import {dockService} from '../dock/service';
import {RelayService as relayServiceClient} from '@docknetwork/wallet-sdk-relay-service/lib';

export function waitFor(condition, timeout) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      if (await Promise.resolve(condition())) {
        clearInterval(interval);
        resolve(true);
      }
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Timed out'));
    }, timeout);
  });
}

/**
 * RelayService
 */
export class RelayService {
  rpcMethods = [
    RelayService.prototype.getMessages,
    RelayService.prototype.sendMessage,
    RelayService.prototype.registerDIDPushNotification,
    RelayService.prototype.resolveDidcommMessage,
  ];

  constructor() {
    this.name = serviceName;
  }

  sendMessage(params: SendMessageParams) {
    validation.sendMessage(params);
    return relayServiceClient.sendMessage(params);
  }

  resolveDidcommMessage(params: ResolveDidcommMessageParams) {
    validation.resolveDidcommMessage(params);
    return relayServiceClient.resolveDidcommMessage(params);
  }

  async getMessages(params: GetMessagesParams) {
    validation.getMessages(params);

    await waitFor(() => dockService.isApiConnected(), 8000);

    return relayServiceClient.getMessages(params);
  }

  registerDIDPushNotification(params: RegisterDIDPushNotificationParams) {
    validation.registerDIDPushNotification(params);
    return relayServiceClient.registerDIDPushNotification(params);
  }
}

export {relayServiceClient};

export const relayService: RelayService = new RelayService();
