import {v4 as uuidv4} from 'uuid';
const didKeyDriver = require('@digitalbazaar/did-method-key').driver();

const DID_DEFAULT_CONTEXT = [
  'https://w3id.org/wallet/v1',
  'https://w3id.org/did-resolution/v1',
];
export const DIDKeyManager = (function () {
  const createDID = async keyDoc => {
    const {didDocument} = await didKeyDriver._keyPairToDidDocument({
      keyPair: {
        ...keyDoc,
        keyPair: keyDoc,
      },
    });

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1000);
    const didResolution = {
      '@context': DID_DEFAULT_CONTEXT,
      id: uuidv4(),
      type: ['DIDResolutionResponse'],
      correlation: [],
      created: new Date().toISOString(),
      expires: expiryDate.toISOString(),
      didDocument,
    };
    return {didResolution, keyDoc};
  };

  return {
    createDID,
  };
})();
