import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import getKeyDoc from '@docknetwork/sdk/utils/vc/helpers';
import {createNewDockDID} from '@docknetwork/sdk/utils/did';
import Keyring from '@polkadot/keyring';
import {randomAsHex} from '@polkadot/util-crypto';

export async function generatePayload(subject, _did) {
  const credentialId = 'http://example.edu/credentials/1986';
  const cred = new VerifiableCredential(credentialId);
  cred.addSubject(subject);

  const keyring = new Keyring();
  const issuerDID = await createNewDockDID();
  const issuerSeed = randomAsHex(32);
  const issuerKey = getKeyDoc(
    issuerDID,
    keyring.addFromUri(issuerSeed, null, 'ed25519'),
    'Ed25519VerificationKey2018',
  );

  await cred.sign(issuerKey);

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
