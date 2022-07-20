import {renderHook} from '@testing-library/react-hooks';
import {useDIDManagement} from './didHooks';
import {useWallet} from './index';

jest.mock('./index.js', () => {
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
  let documents = [
    {
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
    },
    {
      id: 'e8fc7810-9524-11ea-bb37-0242ac130002',
      type: 'DIDResolutionResponse',
      didDocument,
      correlation: [],
    },
  ];
  return {
    useWallet: jest.fn(() => {
      return {
        wallet: {
          query: jest.fn(q => {
            if (q) {
              return documents.filter(singleDocument => {
                for (const key in q) {
                  if (q[key] !== singleDocument[key]) {
                    return false;
                  }
                }
                return true;
              });
            }
            return documents;
          }),
          add: jest.fn(doc => {
            documents.push(doc);
          }),
          update: jest.fn(doc => {
            documents.forEach((singleDocument, index) => {
              if (doc.id === singleDocument.id) {
                documents[index] = doc;
              }
            });
          }),
          remove: jest.fn(documentId => {
            documents = documents.filter(doc => {
              return doc.id !== documentId;
            });
          }),
          accounts: {
            fetchBalance: jest.fn(() => Promise.resolve(0)),
          },
          clear: jest.fn(() => (documents = [])),
        },
        documents,
      };
    }),
  };
});
describe('DID Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('Filter did list', () => {
    const {result} = renderHook(() => useDIDManagement());
    expect(result.current.didList.length).toBe(1);
    expect(result.current.didList[0].type).toBe('DIDResolutionResponse');
  });
  test('Create new DID', async () => {
    const {result} = renderHook(() => useDIDManagement());
    const {result: walletResult} = renderHook(() => useWallet());

    await result.current.createKeyDID({
      derivePath: '',
      type: 'ed25519',
      name: 'DID Name',
    });
    expect(walletResult.current.documents.length).toBe(4);
    expect(
      walletResult.current.documents[3].didDocument.id.indexOf('did:key'),
    ).toBe(0);
  });
  test('Create new DID with invalid params', async () => {
    const {result} = renderHook(() => useDIDManagement());

    await expect(
      result.current.createKeyDID({
        derivePath: '',
        type: 'sr25519',
        name: 'DID Name',
      }),
    ).rejects.toThrowError('sr25519 keypair type  is not supported.');
  });
  test('Edit DID', async () => {
    const {result} = renderHook(() => useDIDManagement());
    const {result: walletResult} = renderHook(() => useWallet());

    await result.current.editDID({
      id: 'e8fc7810-9524-11ea-bb37-0242ac130002',
      name: 'DID Name 2',
    });
    expect(walletResult.current.documents[1].name).toBe('DID Name 2');
  });
  test('Edit DID with invalid params', async () => {
    const {result} = renderHook(() => useDIDManagement());

    await expect(
      result.current.editDID({
        id: '',
        name: 'DID Name 2',
      }),
    ).rejects.toThrowError('Document ID is not set');
  });
  test('Delete DID', async () => {
    const {result} = renderHook(() => useDIDManagement());

    await result.current.deleteDID({
      id: 'e8fc7810-9524-11ea-bb37-0242ac130002',
    });
    const {result: walletResult} = renderHook(() => useWallet());
    expect(walletResult.current.documents.length).toBe(3);
  });
  test('Delete DID with invalid params', async () => {
    const {result} = renderHook(() => useDIDManagement());

    await expect(
      result.current.deleteDID({
        id: '',
      }),
    ).rejects.toThrowError('Document ID is not set');
  });
});
