import {
  base64Decode,
  encodeAddress,
  ed25519PairFromSeed,
  sr25519PairFromSeed,
  secp256k1PairFromSeed,
} from '@polkadot/util-crypto';
import {Ed25519Keypair} from '@docknetwork/credential-sdk/keypairs';
import {decodePair} from '@polkadot/keyring/pair/decode';
import * as bs58 from 'base58-universal';

import {getKeypairFromDoc} from '@docknetwork/universal-wallet/methods/keypairs';

const polkadotTypesToKeys = {
  sr25519: 'Sr25519VerificationKey2020',
  ed25519: 'Ed25519VerificationKey2018',
  secp256k1: 'EcdsaSecp256k1VerificationKey2019',
  ecdsa: 'EcdsaSecp256k1VerificationKey2019',
};

export function getKeyPairType(key) {
  const keyType = key.type || key.constructor.VerKeyType;
  if (keyType) {
    return keyType;
  }

  if (key instanceof Ed25519Keypair) {
    return 'Ed25519VerificationKey2018';
  }

  throw new Error(`Unknown key type for ${key.constructor.name}`);
}

const TYPE_FROM_SEED = {
  ecdsa: secp256k1PairFromSeed,
  secp256k1: secp256k1PairFromSeed,
  ed25519: ed25519PairFromSeed,
  ethereum: secp256k1PairFromSeed,
  sr25519: sr25519PairFromSeed,
};

export function polkadotToKeydoc(
  polkadotKeys,
  controller = undefined,
  keyPassphrase = 'test',
) {
  const keyjson = polkadotKeys.toJson(keyPassphrase);
  const polkadotType = polkadotKeys.type || getKeyPairType(polkadotKeys);

  // NOTE: polkadotKeys.publicKey and publicKey from decodePair result are different for ecdsa type by an extra value on the end
  const decoded = decodePair(
    keyPassphrase,
    base64Decode(keyjson.encoded),
    keyjson.encoding.type,
  );

  let publicKey;
  let secretKey;
  if (decoded.secretKey.length === 64) {
    publicKey = decoded.publicKey;
    secretKey = decoded.secretKey;
  } else {
    const typeFunc = TYPE_FROM_SEED[polkadotType];
    if (!typeFunc) {
      throw new Error(`Unsupported key type: ${polkadotType}`);
    }
    const pair = typeFunc(decoded.secretKey);
    publicKey = pair.publicKey;
    secretKey = pair.secretKey;
  }

  const kpType = polkadotTypesToKeys[polkadotType];
  if (!kpType) {
    throw new Error(`Unknown polkadot type: ${polkadotType}`);
  }

  const publicKeyBase58 = bs58.encode(publicKey);
  const privateKeyBase58 = bs58.encode(secretKey);
  const formattedkeyDoc = {
    id: `${controller}#${encodeAddress(publicKey)}`,
    controller,
    type: kpType,
    publicKeyBase58,
    privateKeyBase58,
    publicKeyMultibase: `z${publicKeyBase58}`,
    privateKeyMultibase: `z${privateKeyBase58}`,
  };

  // auto create controller
  if (!controller) {
    const keypairInstance = getKeypairFromDoc(formattedkeyDoc);
    const fingerprint = keypairInstance.fingerprint();
    if (!formattedkeyDoc.controller) {
      formattedkeyDoc.controller = `did:key:${fingerprint}`;
      formattedkeyDoc.id = `${formattedkeyDoc.controller}#${fingerprint}`;
    }
  }
  return formattedkeyDoc;
}
