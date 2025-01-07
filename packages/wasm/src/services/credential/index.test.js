import {assertRpcService, getPromiseError} from '../test-utils';
import {credentialService as service} from './service';
import {validation} from './config';
import * as credentialsUtils from '@docknetwork/sdk/utils/vc/credentials';
import {CredentialServiceRPC} from './service-rpc';
import {getTestWallet} from '../../test/setup-test-state';
import BbsPlusPresentation from '@docknetwork/sdk/presentation';

describe('Credential Service', () => {
  beforeAll(async () => {
    await getTestWallet();
  });
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

  it('should create unsigned presentation for bbs+ vc', async () => {
    const credentials = [
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          'https://ld.dock.io/security/bbs/v1',
          {
            dk: 'https://ld.dock.io/credentials#',
            BasicCredential: 'dk:BasicCredential',
            name: 'dk:name',
          },
          'https://ld.dock.io/credentials/prettyvc',
        ],
        id: 'http://example.edu/credentials/2803',
        type: ['VerifiableCredential', 'DockAuthCredential'],
        credentialSubject: {
          state: 'dockstagingtestHsBR-jkCCPl4sBOh3f3_n66r9X1uIKgW',
        },
        issuanceDate: '2022-08-26T09:12:15.530Z',
        issuer: 'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ',
        proof: {
          type: 'Bls12381BBS+SignatureDock2022',
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

    expect(presentation.proof).toBeNull();
    expect(presentation.type).toContain('VerifiablePresentation');
  });

  it('expect to create bbs+ presentation', async () => {
    const error1 = await getPromiseError(() =>
      service.createBBSPresentation({
        credentials: [],
      }),
    );
    expect(error1.message).toBe('no credential found');

    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/citizenship/v1',
        'https://ld.dock.io/security/bbs/v1',
      ],
      id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
      type: ['VerifiableCredential', 'PermanentResidentCard'],
      credentialSchema: {
        id: 'data:application/json;charset=utf-8,%7B%22%24schema%22%3A%22http%3A%2F%2Fjson-schema.org%2Fdraft-07%2Fschema%23%22%2C%22%24id%22%3A%22https%3A%2F%2Fld.dock.io%2Fexamples%2Fresident-card-schema.json%22%2C%22title%22%3A%22Resident%20Card%20Example%22%2C%22type%22%3A%22object%22%2C%22properties%22%3A%7B%22%40context%22%3A%7B%22title%22%3A%22Context%22%2C%22type%22%3A%22array%22%2C%22items%22%3A%5B%7B%22type%22%3A%22string%22%7D%2C%7B%22type%22%3A%22string%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%7D%2C%22id%22%3A%7B%22title%22%3A%22Id%22%2C%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22title%22%3A%22Type%22%2C%22type%22%3A%22array%22%2C%22items%22%3A%5B%7B%22type%22%3A%22string%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%7D%2C%22identifier%22%3A%7B%22title%22%3A%22identifier%22%2C%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22title%22%3A%22Name%22%2C%22type%22%3A%22string%22%7D%2C%22description%22%3A%7B%22title%22%3A%22Desc%22%2C%22type%22%3A%22string%22%7D%2C%22credentialSubject%22%3A%7B%22type%22%3A%22object%22%2C%22properties%22%3A%7B%22id%22%3A%7B%22title%22%3A%22Id%22%2C%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22title%22%3A%22Type%22%2C%22type%22%3A%22array%22%2C%22items%22%3A%5B%7B%22type%22%3A%22string%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%7D%2C%22givenName%22%3A%7B%22title%22%3A%22Given%20Name%22%2C%22type%22%3A%22string%22%7D%2C%22familyName%22%3A%7B%22title%22%3A%22Family%20Name%22%2C%22type%22%3A%22string%22%7D%2C%22lprNumber%22%3A%7B%22title%22%3A%22LPR%20Number%22%2C%22type%22%3A%22integer%22%2C%22minimum%22%3A0%7D%7D%2C%22required%22%3A%5B%5D%7D%2C%22expirationDate%22%3A%7B%22title%22%3A%22Expiration%20Date%22%2C%22type%22%3A%22string%22%7D%2C%22issuanceDate%22%3A%7B%22title%22%3A%22Issuance%20Date%22%2C%22type%22%3A%22string%22%7D%2C%22issuer%22%3A%7B%22title%22%3A%22Issuer%20DID%22%2C%22type%22%3A%22string%22%7D%7D%7D',
        type: 'JsonSchemaValidator2018',
      },
      identifier: '83627465',
      name: 'Permanent Resident Card',
      description: 'Government of Example Permanent Resident Card.',
      issuanceDate: '2019-12-03T12:19:52Z',
      expirationDate: '2029-12-03T12:19:52Z',
      credentialSubject: {
        id: 'did:example:b34ca6cd37bbf23',
        type: ['PermanentResident', 'Person'],
        givenName: 'JOHN',
        familyName: 'SMITH',
        lprNumber: 1234,
      },
      issuer: 'did:dock:5EoFfpCyEz1vsBXFP7WPYdaKiFqZaBZa44D2tpFMsEkGVt6P',
      proof: {
        '@context': [
          {
            sec: 'https://w3id.org/security#',
            proof: {
              '@id': 'sec:proof',
              '@type': '@id',
              '@container': '@graph',
            },
          },
          'https://ld.dock.io/security/bbs/v1',
        ],
        type: 'Bls12381BBS+SignatureDock2022',
        created: '2022-12-15T06:39:29Z',
        verificationMethod:
          'did:dock:5EoFfpCyEz1vsBXFP7WPYdaKiFqZaBZa44D2tpFMsEkGVt6P#keys-2',
        proofPurpose: 'assertionMethod',
        proofValue:
          'zVogTRy3DCBqMszawwHN25vBYJLANQjyQQbQBj8j356F8bgUEYJurDvEe4SdZVsfGNEc9Q7de6iiDKYrTtdcs4hKidUZz5FBaj5HyPSHp1mbYZ4c4VhxQnrbnpi6gYezvQuq8rBxwG5gFpqoyPqtsGXeC1',
      },
    };

    const credentials = [
      {credential, attributesToReveal: ['credentialSubject.givenName']},
    ];

    await service.createBBSPresentation({
      credentials,
    });

    const bbsPresentation = new BbsPlusPresentation();
    expect(bbsPresentation.addCredentialToPresent).toBeCalledWith(
      credential,
      expect.any(Object),
    );
    expect(bbsPresentation.addAttributeToReveal).toBeCalledWith(0, [
      'credentialSubject.givenName',
    ]);
    expect(bbsPresentation.createPresentation).toBeCalled();
  });
  it('expect to derive vc from bbs+ presentation', async () => {
    const error1 = await getPromiseError(() =>
      service.deriveVCFromPresentation({
        credentials: [],
      }),
    );
    expect(error1.message).toBe('no credential found');

    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/citizenship/v1',
        'https://ld.dock.io/security/bbs/v1',
      ],
      id: 'https://issuer.oidp.uscis.gov/credentials/83627465',
      type: ['VerifiableCredential', 'PermanentResidentCard'],
      credentialSchema: {
        id: 'data:application/json;charset=utf-8,%7B%22%24schema%22%3A%22http%3A%2F%2Fjson-schema.org%2Fdraft-07%2Fschema%23%22%2C%22%24id%22%3A%22https%3A%2F%2Fld.dock.io%2Fexamples%2Fresident-card-schema.json%22%2C%22title%22%3A%22Resident%20Card%20Example%22%2C%22type%22%3A%22object%22%2C%22properties%22%3A%7B%22%40context%22%3A%7B%22title%22%3A%22Context%22%2C%22type%22%3A%22array%22%2C%22items%22%3A%5B%7B%22type%22%3A%22string%22%7D%2C%7B%22type%22%3A%22string%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%7D%2C%22id%22%3A%7B%22title%22%3A%22Id%22%2C%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22title%22%3A%22Type%22%2C%22type%22%3A%22array%22%2C%22items%22%3A%5B%7B%22type%22%3A%22string%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%7D%2C%22identifier%22%3A%7B%22title%22%3A%22identifier%22%2C%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22title%22%3A%22Name%22%2C%22type%22%3A%22string%22%7D%2C%22description%22%3A%7B%22title%22%3A%22Desc%22%2C%22type%22%3A%22string%22%7D%2C%22credentialSubject%22%3A%7B%22type%22%3A%22object%22%2C%22properties%22%3A%7B%22id%22%3A%7B%22title%22%3A%22Id%22%2C%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22title%22%3A%22Type%22%2C%22type%22%3A%22array%22%2C%22items%22%3A%5B%7B%22type%22%3A%22string%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%7D%2C%22givenName%22%3A%7B%22title%22%3A%22Given%20Name%22%2C%22type%22%3A%22string%22%7D%2C%22familyName%22%3A%7B%22title%22%3A%22Family%20Name%22%2C%22type%22%3A%22string%22%7D%2C%22lprNumber%22%3A%7B%22title%22%3A%22LPR%20Number%22%2C%22type%22%3A%22integer%22%2C%22minimum%22%3A0%7D%7D%2C%22required%22%3A%5B%5D%7D%2C%22expirationDate%22%3A%7B%22title%22%3A%22Expiration%20Date%22%2C%22type%22%3A%22string%22%7D%2C%22issuanceDate%22%3A%7B%22title%22%3A%22Issuance%20Date%22%2C%22type%22%3A%22string%22%7D%2C%22issuer%22%3A%7B%22title%22%3A%22Issuer%20DID%22%2C%22type%22%3A%22string%22%7D%7D%7D',
        type: 'JsonSchemaValidator2018',
      },
      issuanceDate: '2019-12-03T12:19:52Z',
      expirationDate: '2029-12-03T12:19:52Z',
      credentialSubject: {
        id: 'did:example:b34ca6cd37bbf23',
        type: ['PermanentResident', 'Person'],
        givenName: 'JOHN',
        familyName: 'SMITH',
        lprNumber: 1234,
      },
      issuer: 'did:dock:5EoFfpCyEz1vsBXFP7WPYdaKiFqZaBZa44D2tpFMsEkGVt6P',
      proof: {
        '@context': [
          {
            sec: 'https://w3id.org/security#',
            proof: {
              '@id': 'sec:proof',
              '@type': '@id',
              '@container': '@graph',
            },
          },
          'https://ld.dock.io/security/bbs/v1',
        ],
        type: 'Bls12381BBS+SignatureDock2022',
        created: '2022-12-15T06:39:29Z',
        verificationMethod:
          'did:dock:5EoFfpCyEz1vsBXFP7WPYdaKiFqZaBZa44D2tpFMsEkGVt6P#keys-2',
        proofPurpose: 'assertionMethod',
        proofValue:
          'zVogTRy3DCBqMszawwHN25vBYJLANQjyQQbQBj8j356F8bgUEYJurDvEe4SdZVsfGNEc9Q7de6iiDKYrTtdcs4hKidUZz5FBaj5HyPSHp1mbYZ4c4VhxQnrbnpi6gYezvQuq8rBxwG5gFpqoyPqtsGXeC1',
      },
    };

    const credentials = [
      {credential, attributesToReveal: ['credentialSubject.givenName']},
    ];

    await service.deriveVCFromPresentation({
      credentials,
    });

    const bbsPresentation = new BbsPlusPresentation();
    expect(bbsPresentation.addCredentialToPresent).toBeCalledWith(
      credential,
      expect.any(Object),
    );
    expect(bbsPresentation.addAttributeToReveal).toBeCalledWith(0, [
      'credentialSubject.givenName',
    ]);
    expect(bbsPresentation.deriveCredentials).toBeCalledWith({});
  });

  describe('BBS+ revocation', () => {
    it('should get revocation id', async () => {
      expect(
        await service.getAccumulatorId({
          credential: {
            id: 'https://creds.dock.io/ba6740d0a8db6ff8fc9ce68c402a8c14f9b541b1a52fb895008452227c88e37d',
            type: ['VerifiableCredential', 'PersonalData'],
          },
        }),
      ).toBe(null);
      expect(
        await service.getAccumulatorId({
          credential: {
            id: 'https://creds.dock.io/ba6740d0a8db6ff8fc9ce68c402a8c14f9b541b1a52fb895008452227c88e37d',
            type: ['VerifiableCredential', 'PersonalData'],
            credentialStatus: {
              id: 'dock:accumulator:0xa632a41f2fbdb681c14b33daae4fcc46af41661b90b35c4ac1545c9bebf0d7cc',
              type: 'DockVBAccumulator2022',
              revocationCheck: 'membership',
              revocationId: '7',
            },
          },
        }),
      ).toBe(
        'dock:accumulator:0xa632a41f2fbdb681c14b33daae4fcc46af41661b90b35c4ac1545c9bebf0d7cc',
      );
    });
  });

  it('should check if a credential has KVAC support', () => {
    expect(
      service.isKvacCredential({
        credential: {
          proof: {
            type: 'Bls12381BDDT16MACDock2024',
          },
        },
      }),
    ).toBe(false);

    expect(
      service.isKvacCredential({
        credential: {
          proof: {
            type: 'Bls12381BBDT16MACDock2024',
          },
        },
      }),
    ).toBe(true);
  });
});
