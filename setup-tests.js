import '@testing-library/jest-dom';
import {JSDOM} from 'jsdom';
import {NetworkManager} from './packages/core/lib/modules/network-manager';

process.env.ENCRYPTION_KEY =
  '776fe87eec8c9ba8417beda00b23cf22f5e134d9644d0a195cd9e0b7373760c1';

const cfg = {url: 'http://localhost'};
const dom = new JSDOM('', cfg);
global.window = dom.window;
global.document = dom.window.document;

Object.keys(global.window).forEach(property => {
  if (typeof global[property] === 'undefined') {
    global[property] = global.window[property];
  }
});

global.navigator = {
  userAgent: 'node.js',
  appVersion: [],
};

require('./packages/core/lib/setup-tests');

NetworkManager.getInstance().setNetworkId('testnet');

jest.mock('@react-native-async-storage/async-storage', () => 'AsyncStorage');

jest.mock('@docknetwork/wallet-sdk-core/lib/services/dids', () => {
  const originalModule = jest.requireActual(
    '@docknetwork/wallet-sdk-core/lib/services/dids',
  );
  const didDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://ns.did.ai/transmute/v1',
      {
        '@base': 'did:key:z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
      },
    ],
    id: 'did:key:z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
    verificationMethod: [
      {
        id: '#z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
        type: 'JsonWebKey2020',
        controller: 'did:key:z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
        publicKeyJwk: {
          crv: 'Ed25519',
          x: 'vGur-MEOrN6GDLf4TBGHDYAERxkmWOjTbztvG3xP0I8',
          kty: 'OKP',
        },
      },
      {
        id: '#z6LScrLMVd9jvbphPeQkGffSeB99EWSYqAnMg8rGiHCgz5ha',
        type: 'JsonWebKey2020',
        controller: 'did:key:z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
        publicKeyJwk: {
          kty: 'OKP',
          crv: 'X25519',
          x: 'EXXinkMxdA4zGmwpOOpbCXt6Ts6CwyXyEKI3jfHkS3k',
        },
      },
    ],
    authentication: ['#z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg'],
    assertionMethod: ['#z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg'],
    capabilityInvocation: ['#z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg'],
    capabilityDelegation: ['#z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg'],
    keyAgreement: ['#z6LScrLMVd9jvbphPeQkGffSeB99EWSYqAnMg8rGiHCgz5ha'],
  };
  const moduleFunctions = {
    getDIDResolution: jest.fn().mockReturnValue({
      id: new Date().getTime().toString(),
      type: 'DIDResolutionResponse',
      didDocument,
      correlation: [],
    }),
    generateKeyDoc: jest.fn().mockReturnValue({
      '@context': ['https://w3id.org/wallet/v1'],
      id: 'urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002',
      name: 'My Test Key 2',
      image: 'https://via.placeholder.com/150',
      description: 'For testing only, totally compromised.',
      tags: ['professional', 'organization', 'compromised'],
      correlation: [],
      controller: 'did:key:z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r',
      type: 'Ed25519VerificationKey2018',
      privateKeyBase58:
        '3CQCBKF3Mf1tU5q1FLpHpbxYrNYxLiZk4adDtfyPEfc39Wk6gsTb2qoc1ZtpqzJYdM1rG4gpaD3ZVKdkiDrkLF1p',
      publicKeyBase58: '6GwnHZARcEkJio9dxPYy6SC5sAL6PxpZAB6VYwoFjGMU',
    }),
    keypairToDIDKeyDocument: jest.fn().mockReturnValue(didDocument),
  };

  return {
    ...originalModule,
    didServiceRPC: moduleFunctions,
  };
});
