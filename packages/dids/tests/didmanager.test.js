import {DIDKeyManager} from '../src';
const didKeyDriver = require('@digitalbazaar/did-method-key').driver();

describe('DID module', () => {
  it('Create DID', async () => {
    const keyDoc = {
      id: 'urn:uuid:53d846c8-9525-11ea-bb37-0242ac130002',
      name: 'Test',
    };
    const res = await DIDKeyManager.keypairToDidKeyDocument(keyDoc);

    expect(didKeyDriver._keyPairToDidDocument).toBeCalledWith({
      keyPair: {
        ...keyDoc,
        keyPair: keyDoc,
      },
    });
    expect(res).toHaveProperty('didDocument');
    expect(res).toHaveProperty('keyDoc');
  });

  it('Get Did Resolution', async () => {
    const didDocument = {
      id: 'did:key:z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
    };
    const didResolution = await DIDKeyManager.getDidResolution(didDocument);

    expect(didResolution).toHaveProperty('id');
    expect(didResolution).toHaveProperty('type', 'DIDResolutionResponse');
    expect(didResolution).toHaveProperty('correlation', []);
    expect(didResolution).toHaveProperty('created');
    expect(didResolution).toHaveProperty('expires');
    expect(didResolution).toHaveProperty('didDocument', didDocument);
  });
});
