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

  generateKeyDoc: ({derivePath, type}: GenerateKeyDocParams) => {
    if (derivePath) {
      assert(typeof derivePath === 'string', 'invalid derivePath');
    }
    if (type) {
      assert(typeof type === 'string', 'invalid type');
    }
  },
};

export type KeypairToDIDKeyDocumentParams = {
  keypairDoc: any,
};

export type GetDIDResolutionParams = {
  didDocument: any,
};

export type GenerateKeyDocParams = {
  type: string,
  derivePath: string,
  keyPairJSON: any,
};
