import {Ed25519VerificationKey2020} from '@digitalbazaar/ed25519-verification-key-2020';
import {X25519KeyAgreementKey2020} from '@digitalbazaar/x25519-key-agreement-key-2020';
import { Cipher } from '@docknetwork/minimal-cipher';

const cipher = new Cipher({ version: 'recommended' });

export async function getKaKInstanceFromDocument(keyDoc) {
  if (!isValidKeyAgreementDoc(keyDoc)) {
    throw new Error(`Invalid key document type for key agreement key: ${keyDoc.type}`);
  }
  return await X25519KeyAgreementKey2020.from(keyDoc);
}

export async function didcommDecrypt(jwe, keyAgreementKey, keyResolver) {
  return cipher.decryptObject({
    jwe,
    keyAgreementKey,
    keyResolver: keyResolver,
  });
}

export async function getDerivedAgreementKey(derivableKey) {
  // Convert derivable key into latest 2020 format
  const ed2020VerificationKey = await Ed25519VerificationKey2020.from({
    keyPair: derivableKey,
    ...derivableKey,
  });

  // Convert ed25519 2020 verification key into a key agreement key
  const derivedKeyAgreement =
    X25519KeyAgreementKey2020.fromEd25519VerificationKey2020({
      keyPair: ed2020VerificationKey,
    });
  return derivedKeyAgreement;
}


export function isValidKeyAgreementDoc(keyDoc) {
  return keyDoc.type === 'X25519KeyAgreementKey2019' || keyDoc.type === 'X25519KeyAgreementKey2020' || keyDoc.type == 'Ed25519VerificationKey2018' || keyDoc.type == 'Ed25519VerificationKey2020';
}

export function isDerivableKey(keyDoc) {
  return (
    keyDoc.type === 'Ed25519VerificationKey2018' ||
    keyDoc.type === 'Ed25519VerificationKey2019' ||
    keyDoc.type === 'Ed25519VerificationKey2020'
  );
}

export async function getAgreementKeydocFromDidDocument(didDocument) {
  const did = didDocument.id;
  const isDIDUrl = did.indexOf('#') !== -1;

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