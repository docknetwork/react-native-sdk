import {DIDKeyManager} from '../src';
const didKeyDriver = require('@digitalbazaar/did-method-key').driver();

describe('DID module', () => {
  it('Create DID', async () => {
    const keyDoc = {
      id: 'urn:uuid:53d846c8-9525-11ea-bb37-0242ac130002',
      name: 'Test',
    };
    const {didResolution} = await DIDKeyManager.keypairToDidKeyDocument(keyDoc);
    expect(didResolution).toHaveProperty('correlation');
    expect(didResolution).toHaveProperty('@context');
    expect(didResolution).toHaveProperty('id');
    expect(didResolution).toHaveProperty('type', ['DIDResolutionResponse']);
    expect(didResolution).toHaveProperty('didDocument');
    expect(didResolution.correlation.length).toBe(0);

    expect(didKeyDriver._keyPairToDidDocument).toBeCalledWith({
      keyPair: {
        ...keyDoc,
        keyPair: keyDoc,
      },
    });
  });
});
