import assert from 'assert';
import axios from 'axios';
import {
  generateSignedPayload,
  generateSignedPayloadFromList,
  generateSignedPayloadList,
  toBase64,
} from './payloads';

let serviceURL = process.env.RELAY_SERVICE_URL || 'https://relay.dock.io';

const sendMessage = async ({keyPairDoc, recipientDid, message}) => {
  assert(!!keyPairDoc, 'keyPairDoc is required');
  assert(!!recipientDid, 'recipientDid is required');
  assert(!!message, 'message is required');

  const {payload, did} = await generateSignedPayload(keyPairDoc, {
    to: recipientDid,
    msg: message,
  });

  try {
    const result = await axios.post(
      `${serviceURL}/messages/${encodeURIComponent(did)}`,
      {
        payload: toBase64(payload),
      },
    );

    return result.data;
  } catch (err) {
    console.error(err.response);
    return err;
  }
};

const getMessages = async ({keyPairDocs, limit = 20}) => {
  assert(!!keyPairDocs, 'keyPairDoc is required');
  assert(Array.isArray(keyPairDocs), 'keyPairDocs must be an array');
  assert(!!keyPairDocs.length, 'keyPairDocs must not be empty');

  const {payload, dids} = await generateSignedPayloadFromList(keyPairDocs, {
    limit,
  });

  try {
    const result = await axios.get(
      `${serviceURL}/messages/batch-dids?dids=${encodeURIComponent(
        JSON.stringify(dids),
      )}&payload=${toBase64(payload)}`,
    );

    return result.data;
  } catch (err) {
    console.error(err.response);
    return err;
  }
};

const setServiceURL = ({url}) => {
  assert(!!url, 'url is required');

  serviceURL = url;
};

export const RelayService = {
  sendMessage,
  getMessages,
  setServiceURL,
  serviceURL,
};
