import assert from 'assert';

export const serviceName = 'didManager';
export const validation = {
  keypairToDidKeyDocument: ({keypairDoc}) => {
    assert(typeof keypairDoc === 'object', 'invalid keypairDoc');
    assert(keypairDoc.type === 'Ed25519VerificationKey2018', 'invalid type');

    assert(
      keypairDoc.publicKeyBase58 === 'string',
      'publicKeyBase58 is not present',
    );
  },
};
