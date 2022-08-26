import {assertRpcService, getPromiseError} from '../test-utils';
import {credentialService as service} from './service';
import {validation} from '../dids/config';

import {CredentialServiceRPC} from './service-rpc';

describe('DID Service', () => {
  it('ServiceRpc', () => {
    assertRpcService(CredentialServiceRPC, service, validation);
  });
  it('should create a vc', async () => {
    const subject = {
      state: 'debugstate',
    };
    const vc = await service.generateCredential({subject});
    expect(vc).toBeDefined();
    expect(vc).toHaveProperty('context');
    expect(vc).toHaveProperty('credentialSubject', subject);
    expect(vc.type).toContain('VerifiableCredential');
    expect(vc.type).toContain('DockAuthCredential');
  });

  it('should sign a vc', async () => {
    const vc = await service.generateCredential();
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

    const signVc = await service.signCredential({vcJson: vc.toJSON(), keyDoc});
    expect(signVc).toBeDefined();

    expect(signVc).toHaveProperty('proof');
    expect(signVc).toHaveProperty('issuer', keyDoc.controller);
    expect(signVc.type).toContain('VerifiableCredential');
  });
  it('expect to validate errors', async () => {
    const error1 = await getPromiseError(() =>
      service.createPresentation({
        credentials: [],
      }),
    );
    expect(error1.message).toBe('invalid KeyDoc');
    const error2 = await getPromiseError(() =>
      service.createPresentation({
        keyDoc: {},
      }),
    );
    expect(error2.message).toBe('invalid challenge');
  });
  it('should create presentation', async () => {
    const credentials = [
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          {
            dk: 'https://ld.dock.io/credentials#',
            DockAuthCredential: 'dk:DockAuthCredential',
          },
          {state: 'dk:state'},
        ],
        id: 'http://example.edu/credentials/2803',
        type: ['VerifiableCredential', 'DockAuthCredential'],
        credentialSubject: {
          state: 'dockstagingtestHsBR-jkCCPl4sBOh3f3_n66r9X1uIKgW',
        },
        issuanceDate: '2022-08-26T09:12:15.530Z',
        issuer: 'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ',
        proof: {
          type: 'Ed25519Signature2018',
          created: '2022-08-26T09:12:15Z',
          verificationMethod:
            'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ#z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ',
          proofPurpose: 'assertionMethod',
          proofValue:
            'z2DjngsHeuSUNZgfEZ3Vw8TRw3H2g8jobzzWeQU3P2fQcN4RMy9h7vHZCi63yR2iQnPTHnsfaG8MCcKnooXVx2zFz',
        },
      },
    ];
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
    const presentation = await service.createPresentation({
      credentials,
      keyDoc,
      challenge: 'Test',
    });
    expect(presentation).toHaveProperty('proof');
    expect(presentation.type).toContain('VerifiablePresentation');
  });
});
