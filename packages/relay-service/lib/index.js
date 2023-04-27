import {isBase64} from '@polkadot/util-crypto';
import assert from 'assert';
import axios from 'axios';
import {Logger} from '@docknetwork/wallet-sdk-core/lib/core/logger';
import {
  didcommCreateEncrypted,
  didcommDecrypt,
  DIDCOMM_TYPE_ISSUE_DIRECT,
  getDerivedAgreementKey,
} from './didcomm';
import {
  fromBase64,
  generateSignedPayload,
  generateSignedPayloadFromList,
  toBase64,
} from './payloads';
import jwtDecode from 'jwt-decode';

let serviceURL = process.env.RELAY_SERVICE_URL || 'https://relay.dock.io';

export const didcomm = {
  encrypt: didcommCreateEncrypted,
  decrypt: didcommDecrypt,
};

const sendMessage = async ({keyPairDoc, recipientDid, message}) => {
  assert(!!keyPairDoc, 'keyPairDoc is required');
  assert(!!recipientDid, 'recipientDid is required');
  assert(!!message, 'message is required');

  const keyAgreementKey = await getDerivedAgreementKey(keyPairDoc);
  const jweMessage = await didcomm.encrypt({
    recipientDids: [recipientDid],
    type: DIDCOMM_TYPE_ISSUE_DIRECT,
    senderDid: keyPairDoc.controller,
    payload: message,
    keyAgreementKey,
  });

  const {payload, did} = await generateSignedPayload(keyPairDoc, {
    to: recipientDid,
    msg: toBase64(jweMessage),
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

    const data = result.data;

    const messages = await Promise.all(
      data.map(async message => {
        const didCommMessage = await resolveDidcommMessage({
          message,
          keyPairDocs,
        });

        return {
          ...message,
          ...didCommMessage,
          msg: didCommMessage.body,
        };
      }),
    );

    return messages.filter(item => !!item);
  } catch (err) {
    console.error(err.response);
    return err;
  }
};

const registerDIDPushNotification = async ({keyPairDocs, token}) => {
  assert(!!keyPairDocs, 'keyPairDoc is required');
  assert(Array.isArray(keyPairDocs), 'keyPairDocs must be an array');
  assert(!!keyPairDocs.length, 'keyPairDocs must not be empty');
  assert(!!token, 'token is required');

  const {payload, dids} = await generateSignedPayloadFromList(keyPairDocs, {
    token,
  });

  try {
    const result = await axios.post(
      `${serviceURL}/register/batch-dids?dids=${encodeURIComponent(
        JSON.stringify(dids),
      )}&payload=${toBase64(payload)}`,
    );

    return result.data;
  } catch (err) {
    console.error(err.response);
    return err;
  }
};

async function jwtHandler(message) {
  try {
    const jwt = await jwtDecode(message);
    return jwt;
  } catch (err) {
    return false;
  }
}

async function base64Handler(message) {
  if (!isBase64(message)) {
    return false;
  }

  return fromBase64(message);
}

async function jsonHandler(message) {
  try {
    const json = JSON.parse(message);
    return json;
  } catch (err) {
    return false;
  }
}

const messageHandlers = [base64Handler, jwtHandler, jsonHandler];

async function resolveJweString(message) {
  let resolvedMessage = message;

  try {
    for (const handler of messageHandlers) {
      let _result = await handler(resolvedMessage);
      if (_result) {
        resolvedMessage = _result;
      }
    }
  } catch (e) {
    Logger.debug(`Invalid JWE message received: ${message}`);
    console.error(e);
    return null;
  }

  return resolvedMessage;
}

function isURL(str) {
  try {
    // eslint-disable-next-line no-new
    new URL(str);
    return true;
  } catch (err) {
    return false;
  }
}

export async function resolveDidcommMessage({keyPairDocs, message}) {
  assert(!!keyPairDocs, 'keyPairDoc is required');
  assert(Array.isArray(keyPairDocs), 'keyPairDocs must be an array');
  assert(!!keyPairDocs.length, 'keyPairDocs must not be empty');

  let jwe = message.msg || message;

  if (jwe && jwe.indexOf('didcomm://') > -1) {
    jwe = jwe.replace('didcomm://', '');
  }

  if (isURL(jwe)) {
    try {
      const {data} = await axios.get(jwe);
      jwe = data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  if (typeof jwe === 'string') {
    jwe = await resolveJweString(jwe);
  }

  let result = jwe;

  let didCommRecipients = jwe?.recipients?.map(
    recipient => recipient.header.kid,
  );

  // if no recipients, the message is not encrypted
  if (didCommRecipients) {
    const keyPairDoc = keyPairDocs.find(doc =>
      didCommRecipients.find(did => did.indexOf(doc.controller) > -1),
    );

    assert(!!keyPairDoc, `keyPairDoc not found for did ${message.to}`);
    const keyAgreementKey = await getDerivedAgreementKey(keyPairDoc);
    result = await didcommDecrypt(jwe, keyAgreementKey);
  }

  if (!result.body && result.payload) {
    result.body = result.payload;
  }

  return result;
}

const setServiceURL = ({url}) => {
  assert(!!url, 'url is required');

  serviceURL = url;
};

export const RelayService = {
  sendMessage,
  getMessages,
  resolveDidcommMessage,
  registerDIDPushNotification,
  setServiceURL,
  serviceURL,
};
