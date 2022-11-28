import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import {DidKey, VerificationRelationship} from '@docknetwork/sdk/public-keys';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import dock, {PublicKeySr25519} from '@docknetwork/sdk';
import getKeyDoc from '@docknetwork/sdk/utils/vc/helpers';
import {createNewDockDID} from '@docknetwork/sdk/utils/did';
import Keyring from '@polkadot/keyring';
import {randomAsHex} from '@polkadot/util-crypto';

export async function generatePayload(subject = {limit: 10}) {
  await cryptoWaitReady();
  const credentialId = 'http://example.edu/credentials/1986';
  const cred = new VerifiableCredential(credentialId);
  // const issuerDID = await createNewDockDID();
  const keyring = new Keyring();

  const firstKeySeed = randomAsHex(32);
  const firstPair = keyring.addFromUri(firstKeySeed, null, 'sr25519');

  const publicKey = PublicKeySr25519.fromKeyringPair(firstPair);
  const didKey = new DidKey(publicKey, new VerificationRelationship());
  const did = `did:key:${firstPair.address}`;
  // const issuerSeed = randomAsHex(32);
  const issuerKey = getKeyDoc(did, firstPair, 'Ed25519VerificationKey2018');

  cred.setExpirationDate(new Date(Date.now() + 100000000 * 1000).toISOString());
  cred.setSubject(subject);

  const res = await cred.sign(issuerKey);

  return {
    payload: [
      subject,
      cred.issuanceDate,
      cred.expirationDate,
      cred.toJSON().proof,
    ],
    did: did,
  };
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
