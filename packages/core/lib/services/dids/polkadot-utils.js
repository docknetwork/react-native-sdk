// require('@digitalbazaar/x25519-key-agreement-key-2020');
// require('@digitalbazaar/x25519-key-agreement-key-2019');
// require('@digitalbazaar/ed25519-verification-key-2018');
// require('@digitalbazaar/ed25519-verification-key-2020');
import { decodeAddress, encodeAddress, setSS58Format, base64Decode } from '@polkadot/util-crypto';

var base58btc = require('base58-universal');
// require('crypto-ld');
// require('@polkadot/util-crypto/sr25519');
// require('crypto');
// new line
// require('@polkadot/util');
// require('elliptic');
// new line
// require('@docknetwork/universal-wallet/keys/ecdsa-key.js');
// import methods_keypairs = require('./methods/keypairs.js');
var utilCrypto = require('@polkadot/util-crypto');
var decode = require('@polkadot/keyring/pair/decode');
var misc = require('@docknetwork/sdk/utils/misc');
const { getKeypairFromDoc } = require('@docknetwork/universal-wallet/methods/keypairs.js');

const polkadotTypesToKeys = {
  sr25519: 'Sr25519VerificationKey2020',
  ed25519: 'Ed25519VerificationKey2018',
  secp256k1: 'EcdsaSecp256k1VerificationKey2019',
  ecdsa: 'EcdsaSecp256k1VerificationKey2019',
};

// TODO: maybe make this an SDK method instead?
export function polkadotToKeydoc(polkadotKeys, controller = undefined, keyPassphrase = 'test') {
  const keyjson = polkadotKeys.toJson(keyPassphrase); // TODO: update method to import from json out of band
  const polkadotType = polkadotKeys.type || misc.getKeyPairType(polkadotKeys);

  // NOTE: polkadotKeys.publicKey and publicKey from decodePair result are different for ecdsa type by an extra value on the end
  const decoded = decode.decodePair(keyPassphrase, base64Decode(keyjson.encoded), keyjson.encoding.type);

  let publicKey; let
    secretKey;
  if (decoded.secretKey.length === 64) {
    publicKey = decoded.publicKey;
    secretKey = decoded.secretKey;
  } else {
    const typeFunc = TYPE_FROM_SEED[polkadotType];
    if (!typeFunc) {
      console.log('TYPE_FROM_SEED', TYPE_FROM_SEED, polkadotType);
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

  const publicKeyBase58 = base58btc.encode(publicKey);
  const privateKeyBase58 = base58btc.encode(secretKey);
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
