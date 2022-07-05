
# DID Manager

DID manager for the dock wallet sdk

On react native it's required to set up the WalletSDKProvider, described on [@docknetwork/wallet-sdk-react-native](https://www.npmjs.com/package/@docknetwork/wallet-sdk-react-native)

```js
import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids/lib';

// Create did document from keypair

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


// Get DID resolution

const didDocument = {
    id: 'did:key:z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
};

const didResolution = await DIDKeyManager.getDIDResolution(didDocument);

```