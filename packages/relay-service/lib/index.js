import assert from 'assert';
import axios from 'axios';
import {generateSignedPayload, toBase64} from './payloads';

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

const getMessages = async ({keyPairDoc, limit = 20}) => {
  assert(!!keyPairDoc, 'keyPairDoc is required');

  const {payload, did} = await generateSignedPayload(keyPairDoc, {limit});

  try {
    const result = await axios.get(
      `${serviceURL}/messages/${encodeURIComponent(did)}?payload=${toBase64(
        payload,
      )}`,
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
