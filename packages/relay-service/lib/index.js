import assert from 'assert';
import axios from 'axios';
import { generatePayload, toBase64 } from './payloads';

const URL = 
// 'https://relay.dock.io'
// 'http://localhost:3000';
// 'https://relay.dock.io';
'http://localhost:3000';
//;

const sendMessage = async ({ keyPairDoc, recipientDid, message }) => {
  assert(!!keyPairDoc, 'senderDid is required');
  assert(!!recipientDid, 'recipientDid is required');
  assert(!!message, 'message is required');

  const { payload, did } = await generatePayload(keyPairDoc, { to: recipientDid, msg: message });

  try {
    const result = await axios.post(
      `${URL}/messages/${encodeURIComponent(did)}`,
      {
        payload: toBase64(payload)
      }
    );

    return result.data;
  } catch (err) {
    console.error(err.response);
    return err;
  }
};

const getMessages = async ({ keyPairDoc, limit = 20 }) => {
  assert(!!keyPairDoc, 'keyPairDoc is required');

  const { payload, did } = await generatePayload(keyPairDoc, { limit });
  let result;

  try {
    const result = await axios.get(
      `${URL}/messages/${encodeURIComponent(did)}?payload=${toBase64(payload)}`,
    );

    return result.data;
  } catch (err) {
    console.error(err.response);
    return err;
  }
};

const setServiceURL = ({ url }) => {
  URL = url;
};

export const RelayService = {
  sendMessage,
  getMessages,
  setServiceURL,
};
