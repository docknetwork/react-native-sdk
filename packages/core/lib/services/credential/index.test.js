import {assertRpcService} from '../test-utils';
import {credentialService as service} from './service';
import {validation} from '../dids/config';

import {CredentialServiceRPC} from './service-rpc';

describe('DID Service', () => {
  it('ServiceRpc', () => {
    assertRpcService(CredentialServiceRPC, service, validation);
  });
  it('should create a vc', async () => {
    const vc = await service.generateCredential();
    expect(vc).toBeDefined();
    expect(vc).toHaveProperty('context');
    expect(vc).toHaveProperty('credentialSubject');
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
});
