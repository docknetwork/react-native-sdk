import assert from 'assert';
import {isNumberValid} from '../../core/validation';

export const validation = {
  sendMessage({keyPairDoc, recipientDid, message}: SendMessageParams) {
    assert(!!keyPairDoc, 'keyPairDoc is required');
    assert(!!recipientDid, 'recipientDid is required');
    assert(typeof message === 'string', 'invalid message');
  },

  getMessages({keyPairDoc, limit}: GetMessagesParams) {
    assert(!!keyPairDoc, 'keyPairDoc is required');

    if (limit) {
      assert(isNumberValid(limit), 'invalid limit');
    }
  },
};

export const serviceName = 'relayService';

export type GetMessagesParams = {
  keyPairDoc: any,
  limit: number,
};

export type SendMessageParams = {
  keyPairDoc: any,
  recipientDid: string,
  message: string,
};
