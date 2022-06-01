import assert from 'assert';

export const serviceName = 'credentials';
export const validation = {
  signCredential: params => {
    const {vcJson, keyDoc} = params;
    assert(typeof vcJson === 'object', 'invalid vcJson');
    assert(typeof keyDoc === 'object', 'invalid keyDoc');
    assert(keyDoc.type === 'Ed25519VerificationKey2018', 'invalid type');

    assert(
      typeof keyDoc.publicKeyBase58 === 'string',
      'publicKeyBase58 is not present',
    );
  },
};
