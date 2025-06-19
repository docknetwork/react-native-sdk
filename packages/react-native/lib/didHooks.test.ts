import {renderHook} from '@testing-library/react-hooks';
import {useDIDManagement} from './didHooks';
import {useWallet} from './index';
import {didServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/dids';

jest.mock('@docknetwork/wallet-sdk-wasm/src/services/dids', () => {
  const originalModule = jest.requireActual(
    '@docknetwork/wallet-sdk-wasm/src/services/dids',
  );
  const mockFunctions = {
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
    keypairToDIDKeyDocument: jest.fn().mockReturnValue({
      didDocument: {
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
            controller:
              'did:key:z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
            publicKeyJwk: {
              crv: 'Ed25519',
              x: 'vGur-MEOrN6GDLf4TBGHDYAERxkmWOjTbztvG3xP0I8',
              kty: 'OKP',
            },
          },
          {
            id: '#z6LScrLMVd9jvbphPeQkGffSeB99EWSYqAnMg8rGiHCgz5ha',
            type: 'JsonWebKey2020',
            controller:
              'did:key:z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
            publicKeyJwk: {
              kty: 'OKP',
              crv: 'X25519',
              x: 'EXXinkMxdA4zGmwpOOpbCXt6Ts6CwyXyEKI3jfHkS3k',
            },
          },
        ],
        authentication: ['#z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg'],
        assertionMethod: ['#z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg'],
        capabilityInvocation: [
          '#z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
        ],
        capabilityDelegation: [
          '#z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg',
        ],
        keyAgreement: ['#z6LScrLMVd9jvbphPeQkGffSeB99EWSYqAnMg8rGiHCgz5ha'],
      },
    }),
    getDIDResolution: jest.fn(({didDocument}) => {
      return {
        id: new Date().getTime().toString(),
        type: 'DIDResolutionResponse',
        didDocument,
        correlation: [],
      };
    }),
  };

  return {
    ...originalModule,
    didServiceRPC: mockFunctions,
  };
});
// TODO: These mocks are hard to maintain, it mimic the wallet sdk basically
// There is no performance benefits on it, so we should consider to remove it
// and use the real wallet sdk instead
// Additionally we should consider moving the logic from hooks, and expose it as regular js functions
// easier to maintain and to test
jest.mock('./index', () => {
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
      '@context': ['https://w3id.org/wallet/v1'],
      id: 'e8fc7810-9524-11ea-bb37-0242ac130002',
      type: 'DIDResolutionResponse',
      didDocument,
      correlation: ['urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002'],
    },
    {
      '@context': ['https://w3id.org/wallet/v1'],
      id: 'urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002n',
      type: 'Ed25519VerificationKey2018',
      correlation: [],
    },
    {
      '@context': ['https://w3id.org/wallet/v1'],
      didDocument: {
        id: didDocument.id,
      },
      id: 'e8fc7810-9524-11ea-bb37-0242ac130002n',
      type: 'DIDResolutionResponse',
      correlation: ['urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002n'],
    },
  ];
  const mockSingleDoc = documentId => {
    return documents.find(doc => doc.id === documentId);
  };
  const mockFunctions = {
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
      getDocumentsFromEncryptedWallet: jest.fn(
        ({encryptedJSONWallet, password}) => {
          if (password === 'test') {
            return Promise.resolve([
              {
                '@context': ['https://w3id.org/wallet/v1'],
                id: 'urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002',
                name: 'My Test Key 2',
                image: 'https://via.placeholder.com/150',
                description: 'For testing only, totally compromised.',
                tags: ['professional', 'organization', 'compromised'],
                correlation: [],
                controller:
                  'did:key:z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r',
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
            ]);
          } else if (password === 'test2') {
            throw new Error(
              'No matching recipient found for key agreement key.',
            );
          } else if (password === 'duplicate') {
            return Promise.resolve([
              {
                '@context': ['https://w3id.org/wallet/v1'],
                id: 'urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002',
                name: 'My Test Key 2',
                image: 'https://via.placeholder.com/150',
                description: 'For testing only, totally compromised.',
                tags: ['professional', 'organization', 'compromised'],
                correlation: [],
                controller:
                  'did:key:z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r',
                type: 'Ed25519VerificationKey2018',
                privateKeyBase58:
                  '3CQCBKF3Mf1tU5q1FLpHpbxYrNYxLiZk4adDtfyPEfc39Wk6gsTb2qoc1ZtpqzJYdM1rG4gpaD3ZVKdkiDrkLF1p',
                publicKeyBase58: '6GwnHZARcEkJio9dxPYy6SC5sAL6PxpZAB6VYwoFjGMU',
              },
              {
                id: 'e8fc7810-9524-11ea-bb37-0242ac130002n',
                type: 'DIDResolutionResponse',
                correlation: [],
              },
            ]);
          }
          throw new Error('An error occurred');
        },
      ),
      getDocumentById: jest.fn(documentId => {
        const document = mockSingleDoc(documentId);
        if (document) {
          return Promise.resolve(document);
        }
      }),
      getAccountKeyPair: jest.fn(address => {
        if (address) {
          return {
            encoded:
              'MFMCAQEwBQYDK2VwBCIEIBCsEBjFxi3RP8YCclufe+1vKPMqVOYSNZxgmsWQqvpGyw7uvu2ixEfRlwMqwT3jJNAhOZ4izTx5o8veWdVDt7qhIwMhACT2ATM+GBI4XXu+UO/wpgBFtURrTrgsvtYDpW+eB988',
            encoding: {
              content: ['pkcs8', 'sr25519'],
              type: ['none'],
              version: '3',
            },
          };
        }
      }),
      resolveCorrelations: jest.fn(id => {
        const document = mockSingleDoc(id);

        if (document) {
          const correlatedDoc = mockSingleDoc(document.correlation[0]);
          return Promise.resolve([document, correlatedDoc]);
        }
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
      exportDocuments: jest.fn(() => {
        return Promise.resolve({});
      }),
      accounts: {
        fetchBalance: jest.fn(() => Promise.resolve(0)),
      },
      clear: jest.fn(() => (documents = [])),
    },
    documents,
  };
  return {
    useWallet: jest.fn(() => {
      return mockFunctions;
    }),
  };
});
describe('DID Hooks', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Filter did list', () => {
    const {result} = renderHook(() => useDIDManagement());
    expect(result.current.didList.length).toBe(2);
    expect(result.current.didList[0].type).toBe('DIDResolutionResponse');
  });
  test('Create new key DID', async () => {
    const {result} = renderHook(() => useDIDManagement());
    const {result: walletResult} = renderHook(() => useWallet());

    await result.current.createDID({
      derivePath: '',
      type: 'ed25519',
      name: 'DID Name',
      didType: 'didkey',
    });
    expect(walletResult.current.documents.length).toBe(6);
    expect(walletResult.current.wallet.add).toHaveBeenCalledTimes(2);
    expect(
      walletResult.current.documents[3].didDocument.id.indexOf('did:key'),
    ).toBe(0);
  });
  test('Create new key DID with invalid params', async () => {
    const {result} = renderHook(() => useDIDManagement());

    await expect(
      result.current.createDID({
        derivePath: '',
        type: 'sr25519',
        name: 'DID Name',
        didType: '',
      }),
    ).rejects.toThrowError('Invalid DID type');
  });
  test('Edit DID', async () => {
    const {result} = renderHook(() => useDIDManagement());
    const {result: walletResult} = renderHook(() => useWallet());

    await result.current.editDID({
      id: 'e8fc7810-9524-11ea-bb37-0242ac130002',
      name: 'DID Name 2',
    });
    expect(walletResult.current.wallet.update).toBeCalled();
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
    const {result: walletResult} = renderHook(() => useWallet());

    await result.current.deleteDID({
      id: 'e8fc7810-9524-11ea-bb37-0242ac130002',
    });
    expect(walletResult.current.wallet.remove).toBeCalledWith(
      'e8fc7810-9524-11ea-bb37-0242ac130002',
    );
  });
  test('Delete DID with invalid params', async () => {
    const {result} = renderHook(() => useDIDManagement());

    await expect(
      result.current.deleteDID({
        id: '',
      }),
    ).rejects.toThrowError('Document ID is not set');
  });
  test('Export DID', async () => {
    const {result} = renderHook(() => useDIDManagement());
    const {result: walletResult} = renderHook(() => useWallet());
    await result.current.exportDID({
      id: 'e8fc7810-9524-11ea-bb37-0242ac130002n',
      password: 'test',
    });
    expect(walletResult.current.wallet.exportDocuments).toBeCalled();
    expect(walletResult.current.wallet.getDocumentById).toBeCalledWith(
      'e8fc7810-9524-11ea-bb37-0242ac130002n',
    );
    expect(walletResult.current.wallet.resolveCorrelations).toBeCalledWith(
      'e8fc7810-9524-11ea-bb37-0242ac130002n',
    );
  });
  test('Export DID with invalid doc id', async () => {
    const {result} = renderHook(() => useDIDManagement());
    renderHook(() => useWallet());
    await expect(
      result.current.exportDID({
        id: 'x',
        password: 'test',
      }),
    ).rejects.toThrowError('DID Document not found');

    await expect(
      result.current.exportDID({
        id: 'urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002n',
        password: 'test',
      }),
    ).rejects.toThrowError('DID KeyPair not found');
  });
});
