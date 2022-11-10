import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids/src';
import Keyring from '@polkadot/keyring';
import {mnemonicGenerate} from '@polkadot/util-crypto';

// This API does not use the standard query/post parameters approach
// instead, for security reasons, we create a credential for every read/write operation
// we want to perform as a specific DID. The credential is then signed and compacted (see below method)
// to keep the payload small. It is then converted to base64 for transport so that it can be used in headers, query or post body
// in a live environment the below method would require to sign a credential for the subject by that DID (will be done with a client lib)
export async function generatePayload(subject, did) {
  const credentialId = 'http://example.edu/credentials/1986';
  const cred = new VerifiableCredential(credentialId);
  cred.addSubject(subject);

  const keyring = new Keyring();
  const phrase = mnemonicGenerate(12);
  const pair = keyring.addFromMnemonic(phrase, null, 'ed25519');
  const didDoc = await DIDKeyManager.keypairToDIDKeyDocument(pair);

  await cred.sign(didDoc);

  return cred.toJSON();
}

export function generateGetMessagePayload(did, limit = 64) {
  return generatePayload({limit}, did);
}

export function generatePostMessagePayload(to, msg, did) {
  return generatePayload({to, msg}, did);
}

export function toBase64(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
