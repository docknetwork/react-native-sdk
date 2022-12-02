import assert from 'assert';
import axios from 'axios';
import { generatePayload, toBase64 } from './payloads';

let serviceURL = 'https://relay.dock.io';

const sendMessage = async ({ keyPairDoc, recipientDid, message }) => {
  assert(!!keyPairDoc, 'senderDid is required');
  assert(!!recipientDid, 'recipientDid is required');
  assert(!!message, 'message is required');

  const { payload, did } = await generatePayload(keyPairDoc, { to: recipientDid, msg: message });

  try {
    const result = await axios.post(
      `${serviceURL}/messages/${encodeURIComponent(did)}`,
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
      `${serviceURL}/messages/${encodeURIComponent(did)}?payload=${toBase64(payload)}`,
    );

    return result.data;
  } catch (err) {
    console.error(err.response);
    return err;
  }
};

const setServiceURL = ({ url }) => {
  serviceURL = url;
};

export const RelayService = {
  sendMessage,
  getMessages,
  setServiceURL,
  serviceURL
};
