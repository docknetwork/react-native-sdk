import {driver} from '@digitalbazaar/did-method-key';
import {Ed25519VerificationKey2020} from '@digitalbazaar/ed25519-verification-key-2020';
import {v4 as uuidv4} from 'uuid';

const didKeyDriver = driver({
  verificationSuite: Ed25519VerificationKey2020,
});

const DID_DEFAULT_CONTEXT = [
  'https://w3id.org/wallet/v1',
  'https://w3id.org/did-resolution/v1',
];

export const DIDKeyManager = (function () {
  const keypairToDIDKeyDocument = async keyDoc => {
    const {didDocument} = await didKeyDriver._keyPairToDidDocument({
      keyPair: {
        ...keyDoc,
        keyPair: keyDoc,
      },
    });
    return {didDocument, keyDoc};
  };

  const getDIDResolution = didDocument => {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1000);
    return {
      '@context': DID_DEFAULT_CONTEXT,
      id: uuidv4(),
      type: 'DIDResolutionResponse',
      correlation: [],
      created: new Date().toISOString(),
      expires: expiryDate.toISOString(),
      didDocument,
    };
  };

  return {
    keypairToDIDKeyDocument,
    getDIDResolution,
  };
})();
