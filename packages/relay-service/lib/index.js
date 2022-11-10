import assert from 'assert';
import axios from 'axios';
import {generatePayload, toBase64} from './payloads';

let URL = 'https://relay.dock.io';

const sendMessage = async ({senderDid, recipientDid, message}) => {
  assert(!!senderDid, 'senderDid is required');
  assert(!!recipientDid, 'recipientDid is required');
  assert(!!message, 'message is required');
};

const getMessages = async ({recipientDid}) => {
  assert(!!recipientDid, 'recipientDid is required');
  const {payload, did} = await generatePayload({limit: 10});
  let result;

  debugger;

  try {
    result = await axios.get(
      `${URL}/messages/${encodeURIComponent(did)}?payload=${toBase64(payload)}`,
    );
  } catch (err) {
    debugger;
  }

  debugger;

  console.log(result);
  return result;
};

const setServiceURL = ({url}) => {
  URL = url;
};

export const RelayService = {
  sendMessage,
  getMessages,
  setServiceURL,
};
