import {
  VerifiableCredential,
  getSuiteFromKeyDoc,
} from '@docknetwork/credential-sdk/vc';
import {getKeypairFromDoc} from '@docknetwork/universal-wallet/methods/keypairs';
import assert from 'assert';
import base64url from 'base64url';

// 1 year
const DEFAULT_EXPIRATION = 86400 * 1000 * 365;

const isDIDDockRegex = /did:dock/gi;

export function ensureDIDDockFragment(keyDoc) {
  if (!isDIDDockRegex.test(keyDoc.id)) {
    return keyDoc;
  }

  keyDoc.id = keyDoc.id.replace(/#.+/, '');
  keyDoc.id = `${keyDoc.id}#keys-1`;

  return keyDoc;
}

export async function generateSignedPayload(keyPairDoc, subject) {
  assert(!!keyPairDoc, 'keyPairDoc is required');
  assert(!!subject, 'subject is required');

  keyPairDoc = ensureDIDDockFragment(keyPairDoc);

  const cred = new VerifiableCredential('dock:relay');
  cred.setContext([
    'https://www.w3.org/2018/credentials/v1',
    {
      dk: 'https://ld.dock.io/credentials#',
      RelayAuthCredential: 'dk:RelayAuthCredential',
      token: 'dk:token',
      limit: 'dk:limit',
      to: 'dk:to',
      msg: 'dk:msg',
    },
  ]);

  cred.setIssuanceDate(new Date().toISOString());
  cred.setExpirationDate(
    new Date(Date.now() + DEFAULT_EXPIRATION).toISOString(),
  );
  cred.setSubject(subject);
  cred.setIssuer(keyPairDoc.controller);
  cred.addType('RelayAuthCredential');

  const keyPair = getKeypairFromDoc(keyPairDoc);
  keyPair.signer = keyPair.signer();
  const suite = await getSuiteFromKeyDoc(keyPair);

  await cred.sign(suite);

  return {
    payload: [
      subject,
      cred.issuanceDate,
      cred.expirationDate,
      cred.toJSON().proof,
    ],
    did: keyPairDoc.controller,
  };
}

export async function generateSignedPayloadFromList(keyPairDocs, subject) {
  const payload = [];
  const dids = [];

  for (const keyPairDoc of keyPairDocs) {
    const {payload: signedPayload, did} = await generateSignedPayload(
      keyPairDoc,
      subject,
    );
    payload.push(signedPayload);
    dids.push(did);
  }

  return {
    payload,
    dids,
  };
}

export function toBase64(payload) {
  return base64url.encode(JSON.stringify(payload));
}

export function fromBase64(payload) {
  return JSON.parse(base64url.decode(payload));
}
