import { X25519KeyAgreementKey2020 } from '@digitalbazaar/x25519-key-agreement-key-2020';
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';
import { Ed25519VerificationKey2018 } from '@digitalbazaar/ed25519-verification-key-2018';

import { Cipher } from '@docknetwork/minimal-cipher';
import { v1 as uuidv1 } from 'uuid';
import base64url from 'base64url';

import { resolveDID } from './did/dids';
import { BOB_KEY_PAIR_DOC } from '../tests/mock-data';

// TODO: restore importing from the node_modules library when its fixed
// currently has issues with transpilation due to not exporting CJS
// import { RelayService } from '@docknetwork/wallet-sdk-relay-service';
// import { RelayService } from '../wallet-sdk-relay-service';

export const DIDCOMM_TYPE_BASIC = 'https://didcomm.org/basicmessage/1.0/message';

export const DIDCOMM_TYPE_ISSUE_DIRECT =
  'https://didcomm.org/issue-credential/2.0/issue-credential';

export const DIDCOMM_TYPE_REQUEST_ISSUE_WITH_DATA =
  'https://didcomm.org/issue-credential/2.0/offer-credential';

export const userFriendlyTypeMap = {
  issue: DIDCOMM_TYPE_ISSUE_DIRECT,
  'request-data': DIDCOMM_TYPE_REQUEST_ISSUE_WITH_DATA,
};

const cipher = new Cipher({ version: 'recommended' });

function decodeBase64Url(string) {
  const buffer = base64url.toBuffer(string);
  return new Uint8Array(buffer.buffer, buffer.offset, buffer.length);
}

function potentialToArray(a) {
  return a ? (Array.isArray(a) ? a : [a]) : [];
}

export async function getKeydocFromDID(didUrl) {
  const didDocument = await resolveDID(didUrl);
  const possibleKeys = [
    ...potentialToArray(didDocument.verificationMethod),
    ...potentialToArray(didDocument.keyAgreement),
    ...potentialToArray(didDocument.publicKey),
  ];

  const keyDoc = possibleKeys.filter((key) => key.id === didUrl)[0];
  return keyDoc;
}

export function isValidDID(did) {
  const didSplit = did.split(':');
  return didSplit[0] === 'did' && didSplit.length > 2;
}

export async function defaultKaKResolver(keyId) {
  const keyIdStr = keyId.id || keyId;
  const keyDoc = await getAgreementKeydocFromDID(keyIdStr);
  if (!keyDoc) {
    throw new Error(`Cannot find key document with ID: ${keyIdStr}`);
  }
  return await getKaKInstanceFromDocument(keyDoc);
}

export async function defaultVerificationKeyResolver(keyId) {
  const keyIdStr = keyId.id || keyId;
  const keyDoc = await getKeydocFromDID(keyIdStr);
  if (!keyDoc) {
    throw new Error(`Cannot find key document with ID: ${keyIdStr}`);
  }
  return await Ed25519VerificationKey2020.from({ ...keyDoc, keyPair: keyDoc });
}

export async function didcommCreateSignedJWT(payload, privateKeyDoc) {
  const privateKey = await Ed25519VerificationKey2020.from({
    ...privateKeyDoc,
    keyPair: privateKeyDoc,
  });

  const { sign } = privateKey.signer();
  const header = {
    alg: 'EdDSA',
    kid: privateKeyDoc.id,
  };
  const headerBase64URL = base64url(JSON.stringify(header));
  const payloadBase64URL = base64url(JSON.stringify(payload));
  const headerAndPayloadBase64URL = `${headerBase64URL}.${payloadBase64URL}`;
  const signPayload = Buffer.from(headerAndPayloadBase64URL);
  const signature = await sign({ data: signPayload });

  return `${headerAndPayloadBase64URL}.${base64url.encode(signature)}`;
}

export async function didcommDecodeSignedJWT(jwt, keyResolver) {
  const resolveKey = keyResolver || defaultVerificationKeyResolver;
  const jwtSplit = jwt.split('.').map((s) => s.trim());
  if (jwtSplit.length !== 3) {
    throw new Error(`Malformed JWT, got split length: ${jwtSplit.length}`);
  }

  const header = JSON.parse(base64url.decode(jwtSplit[0]));
  const { alg, kid: keyId } = header;
  if (!alg || !keyId) {
    throw new Error('Malformed JWT header, expected alg and kid');
  }

  const publicKey = await resolveKey(keyId);
  const { verify } = publicKey.verifier();

  const signature = decodeBase64Url(jwtSplit[2]);
  const signPayload = Buffer.from(`${jwtSplit[0]}.${jwtSplit[1]}`);

  const isVerified = await verify({ data: signPayload, signature });
  if (!isVerified) {
    throw new Error('JWT cannot be verified');
  }

  const body = JSON.parse(base64url.decode(jwtSplit[1]));
  return body;
}

export async function didcommEncrypt(obj, recipients, keyResolver, senderKey) {
  // If ed25519 is supplied, derive X25519 from it
  let keyAgreementKey = senderKey;
  if (senderKey.type !== 'X25519KeyAgreementKey2020') {
    keyAgreementKey = await getDerivedAgreementKey(senderKey);
  }

  const encryptedJWE = await cipher.encryptObject({
    obj,
    recipients,
    keyResolver: keyResolver || defaultKaKResolver,
    keyAgreementKey,
  });
  return {
    typ: 'application/didcomm-encrypted+json',
    ...encryptedJWE,
  };
}

export async function didcommDecrypt(jwe, keyAgreementKey, keyResolver) {
  return cipher.decryptObject({
    jwe,
    keyAgreementKey,
    keyResolver: keyResolver || defaultKaKResolver,
  });
}

export async function didcommSendMessage(to, message) {
  if (!message.typ || !message.typ.startsWith('application/didcomm')) {
    throw new Error('Only DIDComm messages can be sent with this service');
  }

  // TODO: did doc lookup for "to" and get service endpoint to send to
  // if exists then send there too. this is pretty low priority and
  // should be addressed as tech debt when theres time and its testable

  // const relayResult = await RelayService.sendUnauthedMessage({
  //   recipientDid: to,
  //   message,
  // });

  // return relayResult.id;
}

export function isValidKeyAgreementDoc(keyDoc) {
  return keyDoc.type === 'X25519KeyAgreementKey2019' || keyDoc.type === 'X25519KeyAgreementKey2020';
}

export function isDerivableKey(keyDoc) {
  return (
    keyDoc.type === 'Ed25519VerificationKey2018' ||
    keyDoc.type === 'Ed25519VerificationKey2019' ||
    keyDoc.type === 'Ed25519VerificationKey2020'
  );
}

export async function getAgreementKeydocFromDID(did) {
  if (!did) {
    return undefined;
  }

  // Resolve actual DID document and get key agreement keys
  const isDIDUrl = did.indexOf('#') !== -1;
  const didDocument = await resolveDID(did);

  const keyAgreements = didDocument.keyAgreement
    ? Array.isArray(didDocument.keyAgreement)
      ? didDocument.keyAgreement
      : [didDocument.keyAgreement]
    : [];

  // User supplied full URL, use that if possible
  // if not it may still require derivation to be valid (such as dock DIDs)
  if (isDIDUrl) {
    const foundDoc = keyAgreements.filter(
      (keyDoc) => keyDoc.id === did && isValidKeyAgreementDoc(keyDoc)
    )[0];

    if (foundDoc) {
      return foundDoc;
    }
  }

  // User supplied DID, find first supported keyagreement document
  const firstKeyAgreement = keyAgreements.filter(isValidKeyAgreementDoc)[0];
  if (firstKeyAgreement) {
    return firstKeyAgreement;
  }

  // No valid key agreement found on resolution, lets derive one from a ED25519 key if we can
  const publicKeys = didDocument.publicKey
    ? Array.isArray(didDocument.publicKey)
      ? didDocument.publicKey
      : [didDocument.publicKey]
    : [];


  // See if DID document has any derivable keys
  const derivableKey = publicKeys.filter(isDerivableKey)[0];
  if (derivableKey) {
    return getDerivedAgreementKey(derivableKey);
  }

  throw new Error(`Unable to find or derive X25519 key agreement for DID: ${did}`);
}

export async function getDerivedAgreementKey(derivableKey) {
  if (!isDerivableKey(derivableKey)) {
    throw new Error(`Cannot derive X25519 KAK from type: ${derivableKey.type}`);
  }

  if (!derivableKey.publicKeyMultibase) {
    derivableKey.publicKeyMultibase = derivableKey.publicKeyBase58;
  }

  // Convert derivable key into latest 2020 format
  const ed2020VerificationKey = await Ed25519VerificationKey2020.from({
    keyPair: derivableKey,
    ...derivableKey,
  });

  // Convert ed25519 2020 verification key into a key agreement key
  const derivedKeyAgreement = X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
    keyPair: ed2020VerificationKey,
    ...ed2020VerificationKey,
  });
  return derivedKeyAgreement;
}

export async function getKaKInstanceFromDocument(keyDoc) {
  if (!isValidKeyAgreementDoc(keyDoc)) {
    throw new Error(`Invalid key document type for key agreement key: ${keyDoc.type}`);
  }
  return await X25519KeyAgreementKey2020.from(keyDoc);
}

export function getJWERecipientFromDocument(keyDoc, algorithm) {
  return {
    header: {
      kid: keyDoc.id,
      alg: algorithm || 'ECDH-1PU+A256KW',
    },
  };
}

// Defined here: https://identity.foundation/didcomm-messaging/spec/#plaintext-message-structure
export function formatPayloadToDIDComm(to, msgType, from, body, replyUrl, replyTo) {
  const msg = {
    id: uuidv1(),
    type: userFriendlyTypeMap[msgType] || msgType || DIDCOMM_TYPE_BASIC,
    created_time: Math.floor(Date.now() / 1000), // Unix timestamp, seconds
    from,
    body,
  };
  if (to) {
    msg.to = to;
  }
  if (replyUrl) {
    msg.reply_url = replyUrl;
  }
  if (replyTo) {
    msg.reply_to = [replyTo];
  }
  return msg;
}

export async function didcommCreateEncrypted({
  senderDid,
  recipientDids = [],
  payload,
  type,
  keyAgreementKey,
  algorithm,
}) {
  if (!payload) {
    throw new Error('Requires payload to create encrypted didcomm message');
  }

  if (recipientDids.length === 0) {
    throw new Error('Must supply atleast 1 recipient DID');
  }

  if (!isValidDID(senderDid)) {
    throw new Error('Sender DID must be a valid DID');
  }

  if (!recipientDids.every(isValidDID)) {
    throw new Error('Recipient DID is invalid');
  }

  const recipientKeyDocuments = await Promise.all(recipientDids.map(getAgreementKeydocFromDID));
  const recipients = recipientKeyDocuments.map((keyDoc) =>
    getJWERecipientFromDocument(keyDoc, algorithm)
  );

  const keyResolver = async (keyId) => {
    const keyIdStr = keyId.id || keyId;
    const keyDoc = recipientKeyDocuments.filter((k) => k.id === keyIdStr)[0];
    if (!keyDoc) {
      throw new Error(`Cannot find key document with ID: ${keyIdStr}`);
    }

    const result = await getKaKInstanceFromDocument(keyDoc);

    return result;
  };

  const didcommMessage = formatPayloadToDIDComm(recipientDids, type, senderDid, payload);
  
  try {

    const jweDoc = await didcommEncrypt(didcommMessage, recipients, keyResolver, keyAgreementKey);
    return jweDoc;
  } catch (e) {
    console.error(e);
    throw new Error('Error encrypting message');
  }
}

