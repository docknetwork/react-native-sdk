import { getRealm } from '@docknetwork/wallet-sdk-core/lib/core/realm';
import assert from 'assert';
import { v4 as uuidv4 } from 'uuid';

// 'senderDid': senderDid,
//   'recipientDid': recipientDid,
//   'message': messageEncryptedWithRecipientKey

const sendMessage = async ({ senderDid, recipientDid, message }) => {
  assert(!!senderDid, 'senderDid is required');
  assert(!!recipientDid, 'recipientDid is required');
  assert(!!message, 'message is required');

}

const getMessages = async ({ recipientDid }) => {
  assert(!!recipientDid, 'recipientDid is required');

}

export const RelayService = {
  sendMessage,
  getMessages,
};
