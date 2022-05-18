import {Ed25519VerificationKey2020} from '@digitalbazaar/ed25519-verification-key-2020';
import {CryptoLD} from 'crypto-ld';
const didKeyDriver = require('@digitalbazaar/did-method-key').driver();

export const DIDKeyManager = (function () {
  let wallet;

  const createDidKeyPair = async () => {
    const cryptoLd = new CryptoLD();
    cryptoLd.use(Ed25519VerificationKey2020);
    return cryptoLd.generate({type: 'Ed25519VerificationKey2020'});
  };
  const saveDiDKeyPair = keyPair => {
    return saveToWallet({
      type: 'KEY',
      ...keyPair,
    });
  };
  const createDID = async keyPair => {
    const {didDocument} = await didKeyDriver.publicKeyToDidDoc({
      publicKeyDescription: keyPair,
    });

    if (!Array.isArray(didDocument.correlation)) {
      didDocument.correlation = [];
    }
    didDocument.correlation.push(keyPair.id);
    return didDocument;
  };
  const saveDIDDocument = didDocument => {
    return saveToWallet({
      type: 'DID',
      ...didDocument,
    });
  };
  const saveToWallet = async walletDocument => {
    return wallet.add({
      ...walletDocument,
    });
  };
  const getWallet = () => {
    return wallet;
  };
  const setWallet = _wallet => {
    wallet = _wallet;
  };
  const getDIDs = () => {
    return wallet.query({
      type: 'DID',
    });
  };
  return {
    createDidKeyPair,
    saveDiDKeyPair,
    createDID,
    saveDIDDocument,
    getDIDs,
    setWallet,
    getWallet,
  };
})();
