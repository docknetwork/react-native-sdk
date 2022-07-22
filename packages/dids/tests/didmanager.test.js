import {DIDKeyManager} from '../src';

describe('DID module', () => {
  it('Create DID key', async () => {
    const keyDoc = {
      id: 'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ#z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ',
      controller: 'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ',
      type: 'Ed25519VerificationKey2018',
      publicKeyBase58: '3urLbVGF6ouYwgotxFy6637VcLqugU2s9i2XVY2yGU4v',
      privateKeyBase58:
        '3rF4Jhp7vF6tavGZCSgkdMM3ANLB7YpmzfRcB5FTs1Q7EgN6u5cCwzCaHCDYcestRSEHzjF82TvJUaj3mdqcbGnS',
      publicKeyMultibase: 'z3urLbVGF6ouYwgotxFy6637VcLqugU2s9i2XVY2yGU4v',
      privateKeyMultibase:
        'z3rF4Jhp7vF6tavGZCSgkdMM3ANLB7YpmzfRcB5FTs1Q7EgN6u5cCwzCaHCDYcestRSEHzjF82TvJUaj3mdqcbGnS',
    };

    const {didDocument, keyDoc: resKeyDoc} =
      await DIDKeyManager.keypairToDIDKeyDocument(keyDoc);

    expect(didDocument).toBeDefined();
    expect(resKeyDoc).toBeDefined();
    expect(didDocument).toHaveProperty('@context');
    expect(didDocument).toHaveProperty(
      'id',
      'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ',
    );
  });

  it('Get Did Resolution', async () => {
    const didDocument = {
      id: 'did:key:z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
    };
    const didResolution = await DIDKeyManager.getDIDResolution(didDocument);

    expect(didResolution).toHaveProperty('id');
    expect(didResolution).toHaveProperty('type', 'DIDResolutionResponse');
    expect(didResolution).toHaveProperty('correlation', []);
    expect(didResolution).toHaveProperty('created');
    expect(didResolution).toHaveProperty('expires');
    expect(didResolution).toHaveProperty('didDocument', didDocument);
  });

  it('create did dock', () => {
    
  })
});
