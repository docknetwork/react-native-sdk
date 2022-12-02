import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {getKeypairFromDoc} from '@docknetwork/universal-wallet/methods/keypairs';
import {getSuiteFromKeyDoc} from '@docknetwork/sdk/utils/vc/helpers';

// 1 year
const DEFAULT_EXPIRATION = 86400 * 1000 * 365;

export async function generatePayload(keyPairDoc, subject) {
  await cryptoWaitReady();

  const cred = new VerifiableCredential('dock:relay');
  cred.setContext([
    'https://www.w3.org/2018/credentials/v1',
    {
      dk: 'https://ld.dock.io/credentials#',
      RelayAuthCredential: 'dk:RelayAuthCredential',
      limit: 'dk:limit',
      to: 'dk:to',
      msg: 'dk:msg',
    },
  ]);

  cred.setIssuanceDate(new Date().toISOString());
  cred.setExpirationDate(new Date(Date.now() + DEFAULT_EXPIRATION).toISOString());
  cred.setSubject(subject);
  cred.setIssuer(keyPairDoc.controller);
  cred.addType('RelayAuthCredential');

  const keyPair = getKeypairFromDoc(keyPairDoc);
  keyPair.signer = keyPair.signer();
  const suite = getSuiteFromKeyDoc(keyPair);
  const res = await cred.sign(suite);
  const credJSON = cred.toJSON();

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

export function generateGetMessagePayload(did, limit = 64) {
  return generatePayload({limit}, did);
}

export function generatePostMessagePayload(to, msg, did) {
  return generatePayload({to, msg}, did);
}

export function toBase64(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
