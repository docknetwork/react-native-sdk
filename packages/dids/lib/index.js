'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.DIDKeyManager = void 0;
var _uuid = require('uuid');

const didKeyDriver = require('@digitalbazaar/did-method-key').driver();

const DID_DEFAULT_CONTEXT = [
  'https://w3id.org/wallet/v1',
  'https://w3id.org/did-resolution/v1',
];

const DIDKeyManager = (function () {
  const createDID = async keyDoc => {
    const {didDocument} = await didKeyDriver._keyPairToDidDocument({
      keyPair: {...keyDoc, keyPair: keyDoc},
    }); // add context

    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 100);
    const didResolution = {
      '@context': DID_DEFAULT_CONTEXT,
      id: (0, _uuid.v4)(),
      type: ['DIDResolutionResponse'],
      correlation: [],
      created: new Date().toISOString(),
      expires: expiryDate.toISOString(),
      didDocument,
    };
    return {
      didResolution,
      keyDoc,
    };
  };

  return {
    createDID,
  };
})();

exports.DIDKeyManager = DIDKeyManager;
