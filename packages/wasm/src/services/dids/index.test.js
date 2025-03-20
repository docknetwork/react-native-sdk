import {assertRpcService, getPromiseError} from '../test-utils';
import {DIDServiceRPC} from './service-rpc';
import {didService as service} from './service';
import {validation} from './config';
import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids/src';
import {TestFixtures} from '../../fixtures';
import {getTestWallet} from '../../test/setup-test-state';
import {blockchainService} from '../blockchain/service';
import {DockDid} from '@docknetwork/credential-sdk/types';

describe('DID Service', () => {
  beforeAll(async () => {
    await getTestWallet();
  });

  it('ServiceRpc', () => {
    assertRpcService(DIDServiceRPC, service, validation);
  });

  it('expect to generate DID Key Document from keypair', async () => {
    const keypairDoc = {
      '@context': ['https://w3id.org/wallet/v1'],
      id: 'urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002',
      name: 'My Test Key 2',
      image: 'https://via.placeholder.com/150',
      description: 'For testing only, totally compromised.',
      tags: ['professional', 'organization', 'compromised'],
      correlation: ['4058a72a-9523-11ea-bb37-0242ac130002'],
      controller: 'did:key:z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r',
      type: 'Ed25519VerificationKey2018',
      publicKeyMultibase: 'z3urLbVGF6ouYwgotxFy6637VcLqugU2s9i2XVY2yGU4v',
      privateKeyMultibase:
        'z3rF4Jhp7vF6tavGZCSgkdMM3ANLB7YpmzfRcB5FTs1Q7EgN6u5cCwzCaHCDYcestRSEHzjF82TvJUaj3mdqcbGnS',
      privateKeyBase58:
        '3CQCBKF3Mf1tU5q1FLpHpbxYrNYxLiZk4adDtfyPEfc39Wk6gsTb2qoc1ZtpqzJYdM1rG4gpaD3ZVKdkiDrkLF1p',
      publicKeyBase58: '6GwnHZARcEkJio9dxPYy6SC5sAL6PxpZAB6VYwoFjGMU',
    };
    const spy = jest.spyOn(DIDKeyManager, 'keypairToDIDKeyDocument');

    const res = await service.keypairToDIDKeyDocument({keypairDoc});

    expect(DIDKeyManager.keypairToDIDKeyDocument).toBeCalledWith(keypairDoc);
    expect(res).toBeDefined();
    expect(res).toHaveProperty('didDocument');
    expect(res).toHaveProperty('keyDoc');

    spy.mockReset();
  });

  it('expect to get DID Resolution from DID document', async () => {
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
    };
    const spy = jest.spyOn(DIDKeyManager, 'getDIDResolution');
    const res = await service.getDIDResolution({didDocument});
    expect(DIDKeyManager.getDIDResolution).toBeCalledWith(didDocument, {});
    expect(res).toBeDefined();
    expect(res).toHaveProperty('id');
    spy.mockReset();
  });

  it('expect to get did document', async () => {
    const document = 'document';
    jest
      .spyOn(blockchainService.didModule, 'getDocument')
      .mockResolvedValue(document);

    const result = await service.getDidDockDocument(
      'did:dock:5HL5XB7CHcHT2ZUKjY2SCJvDAK11qoa1exgfVnVTHRbmjJQi',
    );

    expect(result).toStrictEqual(document);
  });

  it('expect to generateKeyDoc without keyPair', async () => {
    const controller =
      'did:dock:5HL5XB7CHcHT2ZUKjY2SCJvDAK11qoa1exgfVnVTHRbmjJQ';
    const keyDoc = await service.generateKeyDoc({
      controller,
    });

    expect(keyDoc.controller).toEqual(controller);
    expect(keyDoc.privateKeyMultibase).toBeDefined();
  });

  it('expect to generateKeyDoc with keyPair', async () => {
    const controller =
      'did:dock:5HL5XB7CHcHT2ZUKjY2SCJvDAK11qoa1exgfVnVTHRbmjJQ';
    const keyPairJSON = {
      encoded:
        'MFMCAQEwBQYDK2VwBCIEIJDIpsaUjZCkVkPmBPqKD0dgu59F8ks4yepJKNFQkz+A/fYvnshD7g1RpaSXuGcLytu6fN/P/PGt2ahhH2Bkh0GhIwMhAP32L57IQ+4NUaWkl7hnC8rbunzfz/zxrdmoYR9gZIdB',
      encoding: {content: ['pkcs8', 'ed25519'], type: ['none'], version: '3'},
      address: '3CGqgBTzZEPyhVTjpWdX5z2uDQ6hxEUALcZ6HthscNnVrKy7',
      meta: {},
    };

    const keyDoc = await service.generateKeyDoc({
      controller,
      keyPairJSON,
    });

    expect(keyDoc.controller).toEqual(controller);
    expect(keyDoc.privateKeyMultibase).toEqual(
      'z3ttk77Si8AUHHGAGLWue3qZacSgZDtRRCbd75Bmujx2qstznWv4ZRWtCjEKcJAUUufQpSsurEAJ47mYYKPwQnA2C',
    );
  });
});
