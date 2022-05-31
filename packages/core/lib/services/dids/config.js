import assert from 'assert';

export const serviceName = 'didManager';
export const validation = {
  keypairToDIDKeyDocument: ({keypairDoc}: KeypairToDIDKeyDocumentParams) => {
    assert(typeof keypairDoc === 'object', 'invalid keypairDoc');
    assert(keypairDoc.type === 'Ed25519VerificationKey2018', 'invalid type');

    assert(
      typeof keypairDoc.publicKeyBase58 === 'string',
      'publicKeyBase58 is not present',
    );
  },
  getDIDResolution: ({didDocument}: GetDIDResolutionParams) => {
    assert(typeof didDocument.id === 'string', 'invalid didDocument');
  },
};

export type KeypairToDIDKeyDocumentParams = {
  keypairDoc: any,
};

export type GetDIDResolutionParams = {
  didDocument: any,
};
