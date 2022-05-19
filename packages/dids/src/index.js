import {v4 as uuidv4} from 'uuid';
import {driver} from '@digitalbazaar/did-method-key';

const didKeyDriver = driver();

const DID_DEFAULT_CONTEXT = [
  'https://w3id.org/wallet/v1',
  'https://w3id.org/did-resolution/v1',
];
export const DIDKeyManager = (function () {
  const keypairToDidKeyDocument = async keyDoc => {
    const {didDocument} = await didKeyDriver._keyPairToDidDocument({
      keyPair: {
        ...keyDoc,
        keyPair: keyDoc,
      },
    });

    return {didDocument, keyDoc};
  };

  return {
    keypairToDidKeyDocument,
  };
})();
