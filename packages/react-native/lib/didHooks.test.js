import {renderHook} from '@testing-library/react-hooks';
import {useDIDManagement} from './didHooks';
import {useWallet} from './index';
import {didServiceRPC} from '@docknetwork/wallet-sdk-core/lib/services/dids';

jest.mock('@docknetwork/wallet-sdk-core/lib/services/dids', () => {
  const originalModule = jest.requireActual(
    '@docknetwork/wallet-sdk-core/lib/services/dids',
  );
  const mockFunctions = {
    generateDIDDockKeyDoc: jest.fn().mockResolvedValue({
      '@context': ['https://w3id.org/wallet/v1'],
      id: 'urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002',
      name: 'My Test Key 2',
      image: 'https://via.placeholder.com/150',
      description: 'For testing only, totally compromised.',
      tags: ['professional', 'organization', 'compromised'],
      correlation: [],
      controller: 'did:dock:z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r',
      type: 'Ed25519VerificationKey2018',
      privateKeyBase58:
        '3CQCBKF3Mf1tU5q1FLpHpbxYrNYxLiZk4adDtfyPEfc39Wk6gsTb2qoc1ZtpqzJYdM1rG4gpaD3ZVKdkiDrkLF1p',
      publicKeyBase58: '6GwnHZARcEkJio9dxPYy6SC5sAL6PxpZAB6VYwoFjGMU',
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
    registerDidDock: jest.fn(address => {
      if (address) {
        return {
          keyPairWalletId: new Date().getTime().toString(),
          dockDID: 'did:dock:z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r',
        };
      }
      throw new Error('address is required');
    }),
    getDidDockDocument: jest.fn(() => {
      return Promise.resolve();
    }),
  };

  return {
    ...originalModule,
    didServiceRPC: mockFunctions,
  };
});
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
  test('Import DID', async () => {
    const {result} = renderHook(() => useDIDManagement());
    const {result: walletResult} = renderHook(() => useWallet());
    const encryptedJSONWallet = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/wallet/v1',
      ],
      id: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh#encrypted-wallet',
      type: ['VerifiableCredential', 'EncryptedWallet'],
      issuer: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
      issuanceDate: '2022-07-19T20:59:44.798Z',
      credentialSubject: {
        id: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
        encryptedWalletContents: {
          protected: 'eyJlbmMiOiJYQzIwUCJ9',
          recipients: [
            {
              header: {
                kid: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh#z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
                alg: 'ECDH-ES+A256KW',
                epk: {
                  kty: 'OKP',
                  crv: 'X25519',
                  x: '-ABoa59NY2qVI66NZ8EbqxCwp02sft5onyKhfa2yfUU',
                },
                apu: '-ABoa59NY2qVI66NZ8EbqxCwp02sft5onyKhfa2yfUU',
                apv: 'ZGlkOmtleTp6NkxTalRiUkVUSmpVQ0RpUW9wYmVDZ1pLUmlzeTdtZGNod2lNQlBUUWt0Y2liR2gjejZMU2pUYlJFVEpqVUNEaVFvcGJlQ2daS1Jpc3k3bWRjaHdpTUJQVFFrdGNpYkdo',
              },
              encrypted_key:
                'Mmf6YGug9bL-L4bi2UwS9R8nUk6bJmgVKJvP2_a0BwsjxtxBN0ly6w',
            },
          ],
          iv: '-u0i0V9ENM3rUwxj-Yv_7jd3veFLzVEO',
          ciphertext:
            'jahwvff1Afy19A9C4kP51nno-14Ea7m-omq39JGlG5_qmmEgrBcd0KsStpfDFKj4gMRR8izsALXqKz78vzhCRTd3RNa5rNOKbzfT3HALRkn1y7n6RlSRRZ0MKuBP9JVg49opLSqAIJ9j64Ebj2KhXALX6Wbv1h9FhAIhIxGkZJZDgKFQmpI54IGKS-J4_19gE2IcJrt7nYb_jXa9VwmmPbH-GDUFGVVbk3uoGCIcpxPSTiwEn7RSC2iSb_kARyOb7ft5546TKiODN-98QMV7lQTn4kZ59RqgC2w7rwDui85He_X21z0GcK9Ipkg5tRm5U7GNqzZtT3Ev952VOUW960istZ6s5gMpcngv0YMGBqnboYqHC3Uq22-ZRM7ya1ijJOi-UD0ozdGNrLs6kdAQWlvrGh7NAnpEdpBfxq_2CuxLZxTI8TGXfpXH39Njc_L3241AISN7HyTrHsoA2F0QIoIE6njMcxaqQy8OWeWYJD7jAhiWMCE-M5UGUbgJUB5BpUV4Q_hndQqL_c5YVf2Fbc98_8vVwtsUeqbMB97qgN3Pq3du00N7rJ7zs9SNuO3D_2A9KD9Y7tN7QywXA565HQC2k-OJpkVqsRDsihWpn3qtTMaSu0OKJS6rKeugSNE6VlsGFC_PoD_6qx3FpcAPsl5_3MDuE-aZBden_iMfUkdXKxZFrkYbc2bLMekoQwa3gfrjBc4EoN9aPbIux3dqS8nBS6-31UCIMkfEv6OmKmm0_wIm-CeMUM8BW9EgGk_9k9kOySZbTQ5VxwomOLWHundKCFTp_I3adoobUORpbxl9LivFqX0T47w5ktblOMUiTMSzgmI4WbGYrvi4otb33vH88aRc_WneCeoSuWFnCUih2R8xBNqhqIESIB1zTqYnVlaENTNZXIRfw7qSatT6i7pnkaBygp059LeBJCkG79V0yB_ZnNTHX3oTViHHNfFmTpeuT7puhWFBkgQnLzr0zdc03hyjVNA99BhR3dz1gjL3TP8TgaYG6LLS2h-6HeLYRX8uDi-SmVU1hIvWR11l6dbzcQrj4b5cjMbbHvyxaegaXCNB5LPLRxg03z1Z74faueBRfWb3l2z_slbAhmJK2KJe9evl47_Fd5RgVAjbxRqwwFAAyUtzKtyHGZhUN7lJrOFATl89mzpGNg0Qt3lTC7rfzCD0xFWruC7PZnw7lCI8aNsPnNMG-2En-JE1eTyMUyG9um7ernec_AUqqntf7JjvNbjQO_PBu6qsOAsaKWbx1DxgEOFa-LPT7NGzBPr13pMFjIoiOXmLUexAl_LuZyEJuyjtfijSepZ6pYEKPQvAFMyNFBO-Og-jRoHaw78mVsoNV2jURkVwDfFuTeA_it5Xk00zgRGra3z1WELN8r-VWBewlj69H7ui4GF0PWZNEG5nxxZbmmrZgvj-Zqv9oCKHC60El2jX2KMniXiBXW-wcoh5pqT4P4dMOqkLdtpOtFvdWW0cQBJEdGcccfWdd0NUIhr0pSL3tfJ5yPxke8kTpHuwIb7Dbb55nqYDpyU-3hdx1QJtTFcCT2EottF0XDx1nrmLM9t_ZpZRx06tOOhK-CQLYNouqaMkpIEuW-utycHuS6qW-dNX95b15r3z1wuLxBA7CxgjYHmswedWnvMNshEIcTLAAYHttSsUVRBVLNVllqKs9swEN2Klq1L0d8iW3KGkpiGfrPpVeobcwB9E2sPIZyjNPwxlQboVAU8evbuk6e4slGTJwnz0VvDpRDtqM9Kz0ndIcuaOoB9he57zi037Aup8C2G8_qATcBhka7SHfP8XJdlDjz7cU5ACl2Mt0FH1C6HPBJj_FKbWLxjPgM17vfeDqgI_R6Du05kTFpQuwyqtnXYk10bd-M50jIWfrlrX-pdSObjolCVEtuUt2lZvZahe0r2bg87Zbk3eFU9bI8eVtdosvSGtP9ZrKfe5BjrfMAC0XsKfWwoKT0JXznXD0Brw11PBQwsslusQOPI6HqskmmaE3NCkKB9a2Wnzs1eO1_Ompqbx_J7uoBphNMzlnrOQL74UVRifDqTFc_o0-rhp3EaXnlDnuOCbYwbOO7Ah3jX5OdU49Vnm-VHIB5_MAtYeEonVaMdSyXa1LXboy-LespvK9P7x1Zfnk5FW9SQCEa1cp7_dXD4h5ho7shKTzPLxbFShKQ_twsoP7JeMdZd1MNCtt_7B9Be-uRfGPwV2XQijME0xtq_8OMhbxFAJh-6MLVZqqKlDSw',
          tag: 'kKoF2f10Da0kBqX2brBZug',
        },
      },
    };
    const password = 'test';
    await result.current.importDID({
      encryptedJSONWallet,
      password,
    });
    expect(walletResult.current.wallet.add).toBeCalled();
  });
  test('Import DID incorrect', async () => {
    const {result} = renderHook(() => useDIDManagement());
    const encryptedJSONWallet = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/wallet/v1',
      ],
      id: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh#encrypted-wallet',
      type: ['VerifiableCredential', 'EncryptedWallet'],
      issuer: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
      issuanceDate: '2022-07-19T20:59:44.798Z',
      credentialSubject: {
        id: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
        encryptedWalletContents: {
          protected: 'eyJlbmMiOiJYQzIwUCJ9',
          recipients: [
            {
              header: {
                kid: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh#z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
                alg: 'ECDH-ES+A256KW',
                epk: {
                  kty: 'OKP',
                  crv: 'X25519',
                  x: '-ABoa59NY2qVI66NZ8EbqxCwp02sft5onyKhfa2yfUU',
                },
                apu: '-ABoa59NY2qVI66NZ8EbqxCwp02sft5onyKhfa2yfUU',
                apv: 'ZGlkOmtleTp6NkxTalRiUkVUSmpVQ0RpUW9wYmVDZ1pLUmlzeTdtZGNod2lNQlBUUWt0Y2liR2gjejZMU2pUYlJFVEpqVUNEaVFvcGJlQ2daS1Jpc3k3bWRjaHdpTUJQVFFrdGNpYkdo',
              },
              encrypted_key:
                'Mmf6YGug9bL-L4bi2UwS9R8nUk6bJmgVKJvP2_a0BwsjxtxBN0ly6w',
            },
          ],
          iv: '-u0i0V9ENM3rUwxj-Yv_7jd3veFLzVEO',
          ciphertext:
            'jahwvff1Afy19A9C4kP51nno-14Ea7m-omq39JGlG5_qmmEgrBcd0KsStpfDFKj4gMRR8izsALXqKz78vzhCRTd3RNa5rNOKbzfT3HALRkn1y7n6RlSRRZ0MKuBP9JVg49opLSqAIJ9j64Ebj2KhXALX6Wbv1h9FhAIhIxGkZJZDgKFQmpI54IGKS-J4_19gE2IcJrt7nYb_jXa9VwmmPbH-GDUFGVVbk3uoGCIcpxPSTiwEn7RSC2iSb_kARyOb7ft5546TKiODN-98QMV7lQTn4kZ59RqgC2w7rwDui85He_X21z0GcK9Ipkg5tRm5U7GNqzZtT3Ev952VOUW960istZ6s5gMpcngv0YMGBqnboYqHC3Uq22-ZRM7ya1ijJOi-UD0ozdGNrLs6kdAQWlvrGh7NAnpEdpBfxq_2CuxLZxTI8TGXfpXH39Njc_L3241AISN7HyTrHsoA2F0QIoIE6njMcxaqQy8OWeWYJD7jAhiWMCE-M5UGUbgJUB5BpUV4Q_hndQqL_c5YVf2Fbc98_8vVwtsUeqbMB97qgN3Pq3du00N7rJ7zs9SNuO3D_2A9KD9Y7tN7QywXA565HQC2k-OJpkVqsRDsihWpn3qtTMaSu0OKJS6rKeugSNE6VlsGFC_PoD_6qx3FpcAPsl5_3MDuE-aZBden_iMfUkdXKxZFrkYbc2bLMekoQwa3gfrjBc4EoN9aPbIux3dqS8nBS6-31UCIMkfEv6OmKmm0_wIm-CeMUM8BW9EgGk_9k9kOySZbTQ5VxwomOLWHundKCFTp_I3adoobUORpbxl9LivFqX0T47w5ktblOMUiTMSzgmI4WbGYrvi4otb33vH88aRc_WneCeoSuWFnCUih2R8xBNqhqIESIB1zTqYnVlaENTNZXIRfw7qSatT6i7pnkaBygp059LeBJCkG79V0yB_ZnNTHX3oTViHHNfFmTpeuT7puhWFBkgQnLzr0zdc03hyjVNA99BhR3dz1gjL3TP8TgaYG6LLS2h-6HeLYRX8uDi-SmVU1hIvWR11l6dbzcQrj4b5cjMbbHvyxaegaXCNB5LPLRxg03z1Z74faueBRfWb3l2z_slbAhmJK2KJe9evl47_Fd5RgVAjbxRqwwFAAyUtzKtyHGZhUN7lJrOFATl89mzpGNg0Qt3lTC7rfzCD0xFWruC7PZnw7lCI8aNsPnNMG-2En-JE1eTyMUyG9um7ernec_AUqqntf7JjvNbjQO_PBu6qsOAsaKWbx1DxgEOFa-LPT7NGzBPr13pMFjIoiOXmLUexAl_LuZyEJuyjtfijSepZ6pYEKPQvAFMyNFBO-Og-jRoHaw78mVsoNV2jURkVwDfFuTeA_it5Xk00zgRGra3z1WELN8r-VWBewlj69H7ui4GF0PWZNEG5nxxZbmmrZgvj-Zqv9oCKHC60El2jX2KMniXiBXW-wcoh5pqT4P4dMOqkLdtpOtFvdWW0cQBJEdGcccfWdd0NUIhr0pSL3tfJ5yPxke8kTpHuwIb7Dbb55nqYDpyU-3hdx1QJtTFcCT2EottF0XDx1nrmLM9t_ZpZRx06tOOhK-CQLYNouqaMkpIEuW-utycHuS6qW-dNX95b15r3z1wuLxBA7CxgjYHmswedWnvMNshEIcTLAAYHttSsUVRBVLNVllqKs9swEN2Klq1L0d8iW3KGkpiGfrPpVeobcwB9E2sPIZyjNPwxlQboVAU8evbuk6e4slGTJwnz0VvDpRDtqM9Kz0ndIcuaOoB9he57zi037Aup8C2G8_qATcBhka7SHfP8XJdlDjz7cU5ACl2Mt0FH1C6HPBJj_FKbWLxjPgM17vfeDqgI_R6Du05kTFpQuwyqtnXYk10bd-M50jIWfrlrX-pdSObjolCVEtuUt2lZvZahe0r2bg87Zbk3eFU9bI8eVtdosvSGtP9ZrKfe5BjrfMAC0XsKfWwoKT0JXznXD0Brw11PBQwsslusQOPI6HqskmmaE3NCkKB9a2Wnzs1eO1_Ompqbx_J7uoBphNMzlnrOQL74UVRifDqTFc_o0-rhp3EaXnlDnuOCbYwbOO7Ah3jX5OdU49Vnm-VHIB5_MAtYeEonVaMdSyXa1LXboy-LespvK9P7x1Zfnk5FW9SQCEa1cp7_dXD4h5ho7shKTzPLxbFShKQ_twsoP7JeMdZd1MNCtt_7B9Be-uRfGPwV2XQijME0xtq_8OMhbxFAJh-6MLVZqqKlDSw',
          tag: 'kKoF2f10Da0kBqX2brBZug',
        },
      },
    };
    const password = 'test2';

    await expect(
      result.current.importDID({
        encryptedJSONWallet,
        password,
      }),
    ).rejects.toThrowError('Incorrect password');

    await expect(
      result.current.importDID({
        encryptedJSONWallet,
        password: 't',
      }),
    ).rejects.toThrowError('An error occurred');
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
    // const {result: walletResult} = renderHook(() => useWallet());

    await expect(
      result.current.exportDID({
        id: 'x',
        password: 'test',
      }),
    ).rejects.toThrowError('DID Document not found');

    await expect(
      result.current.exportDID({
        id: 'e8fc7810-9524-11ea-bb37-0242ac130002',
        password: 'test',
      }),
    ).rejects.toThrowError('DID KeyPair not found');
  });
  test('Import duplicate DID ', async () => {
    const {result} = renderHook(() => useDIDManagement());
    const encryptedJSONWallet = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/wallet/v1',
      ],
      id: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh#encrypted-wallet',
      type: ['VerifiableCredential', 'EncryptedWallet'],
      issuer: 'did:key:z6LSjTbRETJjUCDiQopbeCgZKRisy7mdchwiMBPTQktcibGh',
      issuanceDate: '2022-07-19T20:59:44.798Z',
    };
    const password = 'duplicate';

    await expect(
      result.current.importDID({
        encryptedJSONWallet,
        password,
      }),
    ).rejects.toThrowError('DID already exist in wallet');
  });
  test('can create new DOCK DID', async () => {
    const {result} = renderHook(() => useDIDManagement());
    const {result: walletResult} = renderHook(() => useWallet());

    await result.current.createDID({
      address: '6GwnHZARcEkJio9dxPYy6SC5sAL6PxpZAB6VYwoFjGMU',
      derivePath: '',
      type: 'ed25519',
      name: 'DID Name',
      didType: 'diddock',
    });
    expect(didServiceRPC.generateDIDDockKeyDoc).toHaveBeenCalledWith({
      controller: 'did:dock:z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r',
      keypairId: expect.any(String),
    });
    expect(walletResult.current.wallet.add).toHaveBeenCalledTimes(2);
    expect(didServiceRPC.registerDidDock).toHaveBeenCalledWith(
      '6GwnHZARcEkJio9dxPYy6SC5sAL6PxpZAB6VYwoFjGMU',
    );
    expect(didServiceRPC.getDidDockDocument).toHaveBeenCalledWith(
      'did:dock:z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r',
    );
  });
  test('can create new DOCK DID with invalid params', async () => {
    const {result} = renderHook(() => useDIDManagement());

    await expect(
      result.current.createDID({
        address: '',
        derivePath: '',
        type: 'ed25519',
        name: 'DID Name',
        didType: 'diddock',
      }),
    ).rejects.toThrowError('address is required');
  });
});
