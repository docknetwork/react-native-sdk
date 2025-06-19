import {assertRpcService} from '../test-utils';
import {DIDServiceRPC} from './service-rpc';
import {didService as service} from './service';
import {validation} from './config';
import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids/src';
import {Ed25519Keypair} from '@docknetwork/credential-sdk/keypairs';

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

  it('expect to generateKeyDoc without keyPair', async () => {
    const controller =
      'did:dock:5HL5XB7CHcHT2ZUKjY2SCJvDAK11qoa1exgfVnVTHRbmjJQ';
    const keyDoc = await service.generateKeyDoc({
      controller,
    });

    expect(keyDoc.controller).toEqual(controller);
    expect(keyDoc.privateKeyMultibase).toBeDefined();
  });

  it('expect to deriveKeyDoc', async () => {
    const controller =
      'did:dock:5HL5XB7CHcHT2ZUKjY2SCJvDAK11qoa1exgfVnVTHRbmjJQ';

    const {keyPair} = Ed25519Keypair.random();

    const derivedKeyDoc = await service.deriveKeyDoc({
      controller,
      pair: keyPair,
    });

    expect(derivedKeyDoc.controller).toEqual(controller);
    expect(derivedKeyDoc.privateKeyMultibase).toBeDefined();
  });

  it('expect to createSignedJWT', async () => {
    const headerInput = {
      typ: 'openid4vci-proof+jwt',
      alg: 'EdDSA',
      kid: 'did:key:z6MkjW3DVk4mXjnK8GUuK2SydyFg8oMJbUnHiVzzSz3N9iGM#z6MkjW3DVk4mXjnK8GUuK2SydyFg8oMJbUnHiVzzSz3N9iGM',
    };

    const payload = {
      aud: 'https://api.truvera.io/openid/issuers/d044f3d3-0934-4f62-9b6f-6f06ae8f383e',
      iat: 1750356930,
      exp: 1750357590,
      iss: 'dock.wallet',
    };

    const privateKeyDoc = {
      controller: 'did:key:z6MkjW3DVk4mXjnK8GUuK2SydyFg8oMJbUnHiVzzSz3N9iGM',
      type: 'Ed25519VerificationKey2018',
      id: 'did:key:z6MkjW3DVk4mXjnK8GUuK2SydyFg8oMJbUnHiVzzSz3N9iGM#z6MkjW3DVk4mXjnK8GUuK2SydyFg8oMJbUnHiVzzSz3N9iGM',
      publicKeyMultibase: 'z6MkjW3DVk4mXjnK8GUuK2SydyFg8oMJbUnHiVzzSz3N9iGM',
      privateKeyMultibase:
        'zruzuEmC9VrJ3JUcufskfX4qNKwqqrNDztqJsDp1dXXQFS8CkfEDqK1ZBgNXeWF9xGhAPeVVfV1vL5pVaHpXLU2JwXK',
      privateKeyBase58:
        'GLkPGM4hz3AhQkQA1y63PtxdA3GL4vJiWgYpnB4N1sFi2wzr2tDbc482igkKaDcAwbrhe92LKJygEHd5xmBJtvR',
      publicKeyBase58: '63nAuVpLCCHr1meCdTV8nshgKE5TBbXw2V64ci5MEVUy',
      '@context': ['https://w3id.org/wallet/v1'],
    };

    const signedJWT = await service.createSignedJWT({
      payload,
      privateKeyDoc,
      headerInput,
    });

    expect(signedJWT).toBeDefined();
    expect(signedJWT).toContain('.');
  });
});
