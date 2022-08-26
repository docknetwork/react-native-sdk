import assert from 'assert';

export const serviceName = 'credentials';
export const validation = {
  generateCredential: params => {
    const {subject} = params;
    if (subject) {
      assert(typeof subject === 'object', 'invalid subject');
      assert(Object.keys(subject).length > 0, 'invalid subject');
    }
  },
  signCredential: params => {
    const {vcJson, keyDoc} = params;
    assert(typeof vcJson === 'object', 'invalid vcJson');
    assert(typeof keyDoc === 'object', 'invalid keyDoc');

    assert(
      typeof keyDoc.publicKeyBase58 === 'string',
      'publicKeyBase58 is not present',
    );
  },
  createPresentation: params => {
    const {credentials, keyDoc, challenge} = params;
    assert(typeof keyDoc === 'object', 'invalid KeyDoc');
    assert(typeof challenge === 'string', 'invalid challenge');
    assert(Array.isArray(credentials), 'invalid credentials');
    assert(credentials.length > 0, 'no credential found');
    assert(
      typeof keyDoc.publicKeyBase58 === 'string',
      'publicKeyBase58 is not present',
    );
  },
};
