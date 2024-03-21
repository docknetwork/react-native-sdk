import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {getWallet} from '../helpers/wallet-helpers';
import {createVerificationController} from '@docknetwork/wallet-sdk-core/src/verification-controller';

const expiredCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://ld.dock.io/security/bbs/v1',
    {
      dk: 'https://ld.dock.io/credentials#',
      name: 'dk:name',
    },
  ],
  id: 'https://***REMOVED***/9ef3ba452362eafe574f0dd5c439acb993eb8869173e7cb9ce18451c53bb655e',
  type: ['VerifiableCredential'],
  credentialSubject: {
    id: 'did:key:z6Mkv9oreVc641WshEzJDtnEc55yqh7w3oHeyhbRQz3mY4qm',
    name: 'test',
  },
  issuanceDate: '2024-02-09T19:14:04.108Z',
  expirationDate: '2024-02-09T19:14:04.108Z',
  issuer: {
    name: 'profile bbs+',
    id: 'did:dock:5GJeBeStWSxqyPGUJnERMFhm3wKcfCZP6nhqtoKyRAmq9FeU',
  },
  name: 'New credential',
  cryptoVersion: '0.4.0',
  credentialSchema: {
    id: 'data:application/json;charset=utf-8,%7B%22%24schema%22%3A%22http%3A%2F%2Fjson-schema.org%2Fdraft-07%2Fschema%23%22%2C%22definitions%22%3A%7B%22encryptableCompString%22%3A%7B%22type%22%3A%22string%22%7D%2C%22encryptableString%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22properties%22%3A%7B%22%40context%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSchema%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSubject%22%3A%7B%22properties%22%3A%7B%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22cryptoVersion%22%3A%7B%22type%22%3A%22string%22%7D%2C%22expirationDate%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22issuanceDate%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22issuer%22%3A%7B%22properties%22%3A%7B%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%2C%22proof%22%3A%7B%22properties%22%3A%7B%22%40context%22%3A%7B%22items%22%3A%5B%7B%22properties%22%3A%7B%22proof%22%3A%7B%22properties%22%3A%7B%22%40container%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22sec%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%2C%22type%22%3A%22array%22%7D%2C%22created%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22proofPurpose%22%3A%7B%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%2C%22verificationMethod%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D',
    type: 'JsonSchemaValidator2018',
    parsingOptions: {
      useDefaults: false,
      defaultMinimumInteger: -4294967295,
      defaultMinimumDate: -17592186044415,
      defaultDecimalPlaces: 0,
    },
    version: '0.2.0',
  },
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
    created: '2024-03-20T19:06:04Z',
    verificationMethod:
      'did:dock:5GJeBeStWSxqyPGUJnERMFhm3wKcfCZP6nhqtoKyRAmq9FeU#keys-2',
    proofPurpose: 'assertionMethod',
    proofValue:
      'zYcG91M2FWZiyiQrksCApYy6UwYhXTERyUs2kGwwGaudYhe4W6q25gc2NxEYv75UVYSadC8LUeNXBSx7mnnouDKAL7tUnHAUMTtzw7sk1vjvDHH187sSPw75Pvr6kvuJesUhqomckagET4an9MqAQeuegC',
  },
};

describe('BBS+ with expired credential', () => {
  it('should include expirationDate in the presentation', async () => {
    const wallet: IWallet = await getWallet();
    const controller = await createVerificationController({
      wallet,
    });

    await controller.start({
      template: {
        qr: 'https://***REMOVED***/proof/d3c0c23e-efb5-41fc-a8a9-6213507f419a',
        id: 'd3c0c23e-efb5-41fc-a8a9-6213507f419a',
        name: 'BasicCredential Template',
        nonce: '08ec5ca2e2446b50b25a55e1b6b21f2b',
        created: '2023-10-02T21:30:55.851Z',
        updated: '2023-10-02T21:30:55.851Z',
        verified: false,
        response_url:
          'https://***REMOVED***/proof-requests/d3c0c23e-efb5-41fc-a8a9-6213507f419a/send-presentation',
        request: {
          id: '1cf6a349-f1d3-42f7-b751-8de7fb5fde6c',
          input_descriptors: [
            {
              id: 'Credential 1',
              name: 'Basic Credential (Biometrics)',
              purpose: 'Basic Credential with proof of biometrics',
              constraints: {
                fields: [
                  {
                    path: ['$.credentialSubject.id'],
                  },
                  {
                    path: ['$.expirationDate'],
                  },
                ],
              },
            },
          ],
        },
        type: 'proof-request',
      },
    });

    let attributesToReveal = [
      'credentialSubject.name'
    ];

    controller.selectedCredentials.set(expiredCredential.id, {
      credential: expiredCredential,
      attributesToReveal,
    });

    const presentation = await controller.createPresentation();

    expect(presentation.verifiableCredential[0].expirationDate).toBe(expiredCredential.expirationDate);
  });
});
