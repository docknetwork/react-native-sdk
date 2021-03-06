import {assertRpcService} from '../test-utils';
import {DIDServiceRPC} from './service-rpc';
import {didService as service} from './service';
import {validation} from './config';
import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids/src';

describe('DID Service', () => {
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
      privateKeyBase58:
        '3CQCBKF3Mf1tU5q1FLpHpbxYrNYxLiZk4adDtfyPEfc39Wk6gsTb2qoc1ZtpqzJYdM1rG4gpaD3ZVKdkiDrkLF1p',
      publicKeyBase58: '6GwnHZARcEkJio9dxPYy6SC5sAL6PxpZAB6VYwoFjGMU',
    };
    const res = await service.keypairToDIDKeyDocument({keypairDoc});

    expect(DIDKeyManager.keypairToDIDKeyDocument).toBeCalledWith(keypairDoc);
    expect(res).toBeDefined();
    expect(res).toHaveProperty('didDocument');
    expect(res).toHaveProperty('keyDoc');
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
    const res = await service.getDIDResolution({didDocument});
    expect(DIDKeyManager.getDIDResolution).toBeCalledWith(didDocument);
    expect(res).toBeDefined();
    expect(res).toHaveProperty('id');
  });
});
