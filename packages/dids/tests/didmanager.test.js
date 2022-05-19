import {DIDKeyManager} from '../src';
const didKeyDriver = require('@digitalbazaar/did-method-key').driver();

describe('DID module', () => {
  it('Create DID', async () => {
    const keyDoc = {};
    const {didResolution} = await DIDKeyManager.createDID({});
    expect(didResolution).toHaveProperty('correlation');
    expect(didResolution).toHaveProperty('@context');
    expect(didResolution).toHaveProperty('id');
    expect(didResolution).toHaveProperty('type', ['DIDResolutionResponse']);
    expect(didResolution).toHaveProperty('didDocument');
    expect(didResolution.correlation.length).toBe(0);

    console.log(didResolution);
    expect(didKeyDriver._keyPairToDidDocument).toBeCalledWith({
      keyPair: {
        ...keyDoc,
        keyPair: keyDoc,
      },
    });
  });
});
