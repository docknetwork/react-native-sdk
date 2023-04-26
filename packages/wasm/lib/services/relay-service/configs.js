import assert from 'assert';
import {isNumberValid} from '../../core/validation';

export const validation = {
  sendMessage({keyPairDoc, recipientDid, message}: SendMessageParams) {
    assert(!!keyPairDoc, 'keyPairDoc is required');
    assert(!!recipientDid, 'recipientDid is required');
    assert(!!message, 'message is required');
  },

  getMessages({keyPairDocs, limit}: GetMessagesParams) {
    assert(!!keyPairDocs, 'keyPairDoc is required');

    if (limit) {
      assert(isNumberValid(limit), 'invalid limit');
    }
  },
  registerDIDPushNotification({
    keyPairDocs,
    token,
  }: RegisterDIDPushNotificationParams) {
    assert(!!keyPairDocs, 'keyPairDoc is required');
    assert(!!token, 'token is required');
  },
};

export const serviceName = 'relayService';

export type GetMessagesParams = {
  keyPairDocs: any,
  limit: number,
};

export type SendMessageParams = {
  keyPairDoc: any,
  recipientDid: string,
  message: string,
};

export type RegisterDIDPushNotificationParams = {
  keyPairDocs: any,
  token: string,
};
