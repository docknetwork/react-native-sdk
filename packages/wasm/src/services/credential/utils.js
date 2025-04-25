import * as bs58 from 'base58-universal';
import {Bls12381G2KeyPairDock2022} from '@docknetwork/credential-sdk/vc/crypto';
import {getKeyring} from '../keyring/service';

const docToKeyMap = {
  Sr25519VerificationKey2020: 'sr25519',
  Ed25519VerificationKey2018: 'ed25519',
};
export function keyDocToKeypair(keyDoc, dock) {
  // For now we expect multibase to just be b58, this needs fixing later if/when we support more keys
  const {
    type,
    privateKeyBase58,
    publicKeyBase58,
    privateKeyMultibase,
    publicKeyMultibase,
  } = keyDoc;
  const privateKeyEncoded = privateKeyBase58 || privateKeyMultibase.substr(1);
  const privateKeyBytes = bs58.decode(privateKeyEncoded);

  if (type === 'Bls12381G2VerificationKeyDock2022') {
    return new Bls12381G2KeyPairDock2022(keyDoc);
  } else {
    const publicKeyEncoded = publicKeyBase58 || publicKeyMultibase.substr(1);
    const keyType = docToKeyMap[type];
    if (!keyType) {
      throw new Error(`Unsupported key type: ${type}`);
    }

    return getKeyring().createFromPair(
      {
        publicKey: bs58.decode(publicKeyEncoded),
        secretKey: privateKeyBytes,
      },
      {},
      keyType,
    );
  }
}
