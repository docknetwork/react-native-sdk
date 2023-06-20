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

function ensureDockNetwork() {
  return waitFor(() => dockService.isApiConnected(), 8000);
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

  async sendMessage(params: SendMessageParams) {
    validation.sendMessage(params);

    await ensureDockNetwork();

    return relayServiceClient.sendMessage(params);
  }

  async resolveDidcommMessage(params: ResolveDidcommMessageParams) {
    validation.resolveDidcommMessage(params);

    await ensureDockNetwork();

    return relayServiceClient.resolveDidcommMessage(params);
  }

  async getMessages(params: GetMessagesParams) {
    validation.getMessages(params);

    await ensureDockNetwork();

    return relayServiceClient.getMessages(params);
  }

  registerDIDPushNotification(params: RegisterDIDPushNotificationParams) {
    validation.registerDIDPushNotification(params);
    return relayServiceClient.registerDIDPushNotification(params);
  }
}

export {relayServiceClient};

export const relayService: RelayService = new RelayService();
