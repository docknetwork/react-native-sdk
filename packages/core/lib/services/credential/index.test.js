import {assertRpcService, getPromiseError} from '../test-utils';
import {credentialService as service} from './service';
import {validation} from './config';
import * as credentialsUtils from '@docknetwork/sdk/utils/vc/credentials';

import {CredentialServiceRPC} from './service-rpc';

describe('DID Service', () => {
  it('ServiceRpc', () => {
    assertRpcService(CredentialServiceRPC, service, validation);
  });
  it('expect to validate errors when verifying credential', async () => {
    const error0 = await getPromiseError(() => service.verifyCredential({}));
    expect(error0.message).toBe('invalid credential');
  });
  it('expect to verify credential', async () => {
    jest
      .spyOn(credentialsUtils, 'verifyCredential')
      .mockImplementationOnce(async () => ({verified: true}));
    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        {
          dk: 'https://ld.dock.io/credentials#',
          BasicCredential: 'dk:BasicCredential',
          name: 'dk:name',
          email: 'dk:email',
          title: 'dk:title',
          description: 'dk:description',
          logo: 'dk:logo',
        },
        {
          prettyVC: 'https://ld.dock.io/credentials#prettyVC',
          orientation: 'https://ld.dock.io/credentials#orientation',
          size: 'https://ld.dock.io/credentials#size',
        },
      ],
      credentialStatus: {
        id: 'rev-reg:dock:0xccf6767a9337d89171a478a31318db2e55a6e7bd0858e080fdd6507990072a63',
        type: 'CredentialStatusList2017',
      },
      id: 'https://creds-testnet.dock.io/e185bba44983790adab513caa84c9ec4debaa2efa9f59b62d96f392eccfdefb6',
      type: ['VerifiableCredential', 'BasicCredential'],
      credentialSubject: {
        id: 'ifeanyiosinakayah15@gmail.com',
        name: 'Ifeanyi Osinakayah',
        email: 'ifeanyiosinakayah15@gmail.com',
        title: 'Basic Credential',
      },
      issuanceDate: '2022-10-26T21:01:54.492Z',
      expirationDate: '2024-10-25T23:00:00.000Z',

      proof: {
        type: 'Ed25519Signature2018',
        created: '2022-10-26T21:03:26Z',
        verificationMethod:
          'did:dock:5DXYT99kpHozJwp8TDbTiwrtoMxJ8Nbq8pSQ8w3hWMz1hw64#keys-1',
        proofPurpose: 'assertionMethod',
        proofValue:
          'z54wiAXqaiwVu3z7ypPEfKrf9bfnsjjUcWkTzqJ6nCsdMjwx3KSYqPN5VoGrSqgg83Ug99QKhLJ8geQhDTaoxdyYP',
      },
      issuer: {
        name: 'Ifeanyi Osinakayah',
        description: '',
        logo: '',
        id: 'did:dock:5DXYT99kpHozJwp8TDbTiwrtoMxJ8Nbq8pSQ8w3hWMz1hw64',
      },
    };
    await service.verifyCredential({credential});
    expect(credentialsUtils.verifyCredential).toBeCalled();
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
    const error0 = await getPromiseError(() =>
      service.createPresentation({
        credentials: [],
      }),
    );
    expect(error0.message).toBe('invalid id');

    const error1 = await getPromiseError(() =>
      service.createPresentation({
        id: 'http://example.edu/credentials/1986',
        credentials: [],
      }),
    );
    expect(error1.message).toBe('invalid KeyDoc');
    const error2 = await getPromiseError(() =>
      service.createPresentation({
        id: 'http://example.edu/credentials/1986',
        keyDoc: {},
        credentials: [],
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
      id: 'http://example.edu/credentials/1986',
    });
    expect(presentation).toHaveProperty('proof');
    expect(presentation.type).toContain('VerifiablePresentation');
  });
});
