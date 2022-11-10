import assert from 'assert';
import axios from 'axios';

let URL = 'https://relay.dock.io/';

const sendMessage = async ({senderDid, recipientDid, message}) => {
  assert(!!senderDid, 'senderDid is required');
  assert(!!recipientDid, 'recipientDid is required');
  assert(!!message, 'message is required');
};

const getMessages = async ({recipientDid}) => {
  assert(!!recipientDid, 'recipientDid is required');
};

const setServiceURL = ({url}) => {
  URL = url;
};

export const RelayService = {
  sendMessage,
  getMessages,
  setServiceURL,
};
