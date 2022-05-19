import {driver} from '@digitalbazaar/did-method-key';

const didKeyDriver = driver();

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
