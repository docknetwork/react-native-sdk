import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {closeWallet, getWallet} from '../helpers/wallet-helpers';
import {createVerificationController} from '@docknetwork/wallet-sdk-core/src/verification-controller';
import {credentialService} from '@docknetwork/wallet-sdk-wasm/src/services/credential/service';
import {blockchainService} from '@docknetwork/wallet-sdk-wasm/src/services/blockchain';
import {autoLoanProofRequest} from './proof-requests';

const biometricCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://ld.dock.io/security/bbs/v1',
    {
      dk: 'https://ld.dock.io/credentials#',
      ForSurBiometric: 'dk:ForSurBiometric',
      biometric: 'dk:biometric',
      created: 'dk:created',
      data: 'dk:data',
      name: 'dk:name',
      description: 'dk:description',
      logo: 'dk:logo',
    },
  ],
  id: 'https://creds-testnet.dock.io/42c04f6161af5506cd93d0b2684b0cbaa953dcf831e6cfecc39fd5def0bbcbf5',
  type: ['VerifiableCredential', 'ForSurBiometric'],
  credentialSubject: {
    id: 'did:key:z6MkoWAL66HUG7SHmJpwisjbUrjgaUZZnesNXp5m2CDmrFkT',
    biometric: {
      id: '2e605b43-98d7-42bb-aac5-f9980007a147',
      created: '2024-06-11T19:51:55.666Z',
      data: true,
    },
  },
  issuanceDate: '2024-06-11T19:51:55.666Z',
  expirationDate: '2024-06-11T19:53:55.664Z',
  issuer: {
    name: 'Forsur',
    description: 'Forsur is the biometric provider.',
    logo: 'https://img.dock.io/80f154126a78bba321b413c3ffb8d4a7',
    id: 'did:dock:5HLbQLSmirNuZVRsdWKbsgdajw9QTGzSFJABSVzMT5EBj5sb',
  },
  credentialSchema: {
    id: 'data:application/json;charset=utf-8,%7B%22%24schema%22%3A%22http%3A%2F%2Fjson-schema.org%2Fdraft-07%2Fschema%23%22%2C%22definitions%22%3A%7B%22encryptableCompString%22%3A%7B%22type%22%3A%22string%22%7D%2C%22encryptableString%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22properties%22%3A%7B%22%40context%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSchema%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSubject%22%3A%7B%22properties%22%3A%7B%22biometric%22%3A%7B%22properties%22%3A%7B%22created%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22data%22%3A%7B%22type%22%3A%22boolean%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22cryptoVersion%22%3A%7B%22type%22%3A%22string%22%7D%2C%22expirationDate%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22issuanceDate%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22issuer%22%3A%7B%22properties%22%3A%7B%22description%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22logo%22%3A%7B%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%2C%22proof%22%3A%7B%22properties%22%3A%7B%22%40context%22%3A%7B%22items%22%3A%5B%7B%22properties%22%3A%7B%22proof%22%3A%7B%22properties%22%3A%7B%22%40container%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22sec%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%2C%22type%22%3A%22array%22%7D%2C%22created%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22proofPurpose%22%3A%7B%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%2C%22verificationMethod%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D',
    type: 'JsonSchemaValidator2018',
    parsingOptions: {
      useDefaults: true,
      defaultMinimumInteger: -4294967295,
      defaultMinimumDate: -17592186044415,
      defaultDecimalPlaces: 4,
    },
    version: '0.3.0',
  },
  name: 'ForSurBiometric',
  cryptoVersion: '0.5.0',
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
    created: '2024-06-11T19:52:42Z',
    verificationMethod:
      'did:dock:5HLbQLSmirNuZVRsdWKbsgdajw9QTGzSFJABSVzMT5EBj5sb#keys-2',
    proofPurpose: 'assertionMethod',
    proofValue:
      'zY6FZ8hvC7rcJFBdCzDEnT3RUxeF4kjPjD3e6Eyg8wnqs9cPuvXaZ9Vcwke895LqCUNfAbUhZZDiMMb6FMLNrnNYQv2ikrjzpcU9gVuVaCZQH8rQvGNqXMBP5Cf3wjN7VFuQEp75Fp9sAkDfkSswQcNzut',
  },
};

const creditScoreCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/2021/v1',
    {
      dk: 'https://ld.dock.io/credentials#',
      EquiNetCreditScore: 'dk:EquiNetCreditScore',
      credit_score: 'dk:credit_score',
      name: 'dk:name',
      description: 'dk:description',
      logo: 'dk:logo',
    },
  ],
  credentialStatus: {
    id: 'status-list2021:dock:0x1253ed4ab4a818aaa6609a21f932dca0f0e58430d2b19efd1a008bac8e98a353#38',
    type: 'StatusList2021Entry',
    statusListIndex: '38',
    statusListCredential:
      'status-list2021:dock:0x1253ed4ab4a818aaa6609a21f932dca0f0e58430d2b19efd1a008bac8e98a353',
    statusPurpose: 'suspension',
  },
  id: 'https://creds-testnet.dock.io/9ee9d7581666c6a05a68a3cf730be4e8648d7ef74198aa8d63ecad624940eb38',
  type: ['VerifiableCredential', 'EquiNetCreditScore'],
  credentialSubject: {
    id: 'did:key:z6MkoWAL66HUG7SHmJpwisjbUrjgaUZZnesNXp5m2CDmrFkT',
    credit_score: 707,
  },
  issuanceDate: '2024-06-11T19:37:10.792Z',
  name: 'EquiNet - Credit Score',
  description:
    'This schema represents a Verified Credit Score Credential, issued by EquiNet. It standardizes the presentation of credit scores for reliable and efficient verification processes.',
  issuer: {
    name: 'EquiNET',
    description: 'EquiNet is the credit bureau.',
    logo: 'https://img.dock.io/9f327cafda3be5f0cff0da2df44c55da',
    id: 'did:dock:5CKsfvaE68mvRhdn3dDXG4KpWzuvaUNdBbiu6sFUuPK9rw66',
  },
  proof: {
    type: 'Ed25519Signature2018',
    created: '2024-06-11T19:37:11Z',
    verificationMethod:
      'did:dock:5CKsfvaE68mvRhdn3dDXG4KpWzuvaUNdBbiu6sFUuPK9rw66#keys-1',
    proofPurpose: 'assertionMethod',
    jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..o1pP7OiFZ_IeaLiebDIj6cl3-mor-61RoFLNc_HNyqG4WCfAkXBGiDZi5I3s50xsh3QjlMdFO3s7kswq4DwuCg',
  },
};

const bankIdentityCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://ld.dock.io/security/bbs23/v1',
    {
      dk: 'https://ld.dock.io/credentials#',
      QuotientBankIdentity: 'dk:QuotientBankIdentity',
      name: 'dk:name',
      address: 'dk:address',
      city: 'dk:city',
      zip: 'dk:zip',
      state: 'dk:state',
      account_number: 'dk:account_number',
      biometric: 'dk:biometric',
      data: 'dk:data',
      created: 'dk:created',
      description: 'dk:description',
      logo: 'dk:logo',
    },
  ],
  id: 'https://creds-testnet.dock.io/94796f24-7872-4cf7-a27a-3c959c781740',
  type: ['VerifiableCredential', 'QuotientBankIdentity'],
  credentialSubject: {
    id: 'did:key:z6MkoWAL66HUG7SHmJpwisjbUrjgaUZZnesNXp5m2CDmrFkT',
    name: 'Euan Miller',
    address: '123 Sample Street',
    city: 'Sacramento',
    zip: '01234',
    state: 'California',
    account_number: 'ABC3211594c-0e3f-4677-beea-35c6484ac66e',
    biometric: {
      id: '2e605b43-98d7-42bb-aac5-f9980007a147',
      data: true,
      created: '2024-06-11T19:35:52.160Z',
    },
  },
  issuanceDate: '2024-06-11T19:37:09.485Z',
  credentialSchema: {
    id: 'data:application/json;charset=utf-8,%7B%22%24schema%22%3A%22http%3A%2F%2Fjson-schema.org%2Fdraft-07%2Fschema%23%22%2C%22definitions%22%3A%7B%22encryptableCompString%22%3A%7B%22type%22%3A%22string%22%7D%2C%22encryptableString%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22properties%22%3A%7B%22%40context%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSchema%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSubject%22%3A%7B%22properties%22%3A%7B%22account_number%22%3A%7B%22type%22%3A%22string%22%7D%2C%22address%22%3A%7B%22type%22%3A%22string%22%7D%2C%22biometric%22%3A%7B%22properties%22%3A%7B%22created%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22data%22%3A%7B%22type%22%3A%22boolean%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22city%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%2C%22state%22%3A%7B%22type%22%3A%22string%22%7D%2C%22zip%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22cryptoVersion%22%3A%7B%22type%22%3A%22string%22%7D%2C%22description%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22issuanceDate%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22issuer%22%3A%7B%22properties%22%3A%7B%22description%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22logo%22%3A%7B%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%2C%22proof%22%3A%7B%22properties%22%3A%7B%22%40context%22%3A%7B%22items%22%3A%5B%7B%22properties%22%3A%7B%22proof%22%3A%7B%22properties%22%3A%7B%22%40container%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22sec%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%2C%22type%22%3A%22array%22%7D%2C%22created%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22proofPurpose%22%3A%7B%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%2C%22verificationMethod%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D',
    type: 'JsonSchemaValidator2018',
    parsingOptions: {
      useDefaults: true,
      defaultMinimumInteger: -4294967295,
      defaultMinimumDate: -17592186044415,
      defaultDecimalPlaces: 4,
    },
    version: '0.3.0',
  },
  name: 'Quotient - Bank Identity',
  description:
    'The "Quotient - Bank Identity" schema provides a secure and standardized format for representing key aspects of an individual\'s bank identity.',
  issuer: {
    name: 'Quotient Credit Union',
    description: 'Quotient is our credit union',
    logo: 'https://img.dock.io/06d78272268c606a172d5fd1cd559b46',
    id: 'did:dock:5HKkVpaciu1RArV13E7ig3i84JtiMTcwoXoHPZ8VMrBUYJ4w',
  },
  cryptoVersion: '0.5.0',
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
      'https://ld.dock.io/security/bbs23/v1',
    ],
    type: 'Bls12381BBSSignatureDock2023',
    created: '2024-06-11T19:37:09Z',
    verificationMethod:
      'did:dock:5HKkVpaciu1RArV13E7ig3i84JtiMTcwoXoHPZ8VMrBUYJ4w#keys-3',
    proofPurpose: 'assertionMethod',
    proofValue:
      'z2ngTQkXFacLsA4BvaqsgndyHApqECXgKD3zd7WXWXBcVv9X89uHsg8xXeicqpfxDB6MfnpVPegT1g9vKvVg9VN59CBQ8b3bPoctd7PMGh8gWHV',
  },
};

describe('BBS+ presentations', () => {
  it('should verify an auto loan proof request', async () => {
    const wallet: IWallet = await getWallet();
    const controller = await createVerificationController({
      wallet,
    });

    const proofRequest = {
      qr: 'https://creds-example.dock.io/proof/d3c0c23e-efb5-41fc-a8a9-6213507f419a',
      id: 'd3c0c23e-efb5-41fc-a8a9-6213507f419a',
      name: 'BasicCredential Template',
      nonce: '08ec5ca2e2446b50b25a55e1b6b21f2b',
      created: '2023-10-02T21:30:55.851Z',
      updated: '2023-10-02T21:30:55.851Z',
      verified: false,
      response_url: `/proof-requests/d3c0c23e-efb5-41fc-a8a9-6213507f419a/send-presentation`,
      request: {
        id: '37ba730c-4b58-44d3-88cd-d4f5be32b698',
        input_descriptors: [
          {
            id: 'Credential 1',
            name: 'Quotient Loan Verification - Bank Identity, Biometrics, and Credit Score',
            group: ['A'],
            purpose:
              'Quotient wants to verify the ownership of - Bank Identity, Biometrics and Credit Score Credentials.',
            constraints: {
              fields: [
                {
                  path: ['$.credentialSubject.id'],
                },
                {
                  path: ['$.type[*]'],
                },
                {
                  path: ['$.type[*]'],
                  filter: {
                    const: 'QuotientBankIdentity',
                  },
                  predicate: 'required',
                },
              ],
            },
          },
          {
            id: 'Credential 2',
            name: 'Quotient Loan Verification - Bank Identity, Biometrics, and Credit Score',
            group: ['A'],
            purpose:
              'Quotient wants to verify the ownership of - Bank Identity, Biometrics and Credit Score Credentials.',
            constraints: {
              fields: [
                {
                  path: ['$.credentialSubject.id'],
                },
                {
                  path: ['$.type[*]'],
                },
                {
                  path: ['$.type[*]'],
                  filter: {
                    const: 'ForSurBiometric',
                  },
                  predicate: 'required',
                },
                {
                  path: ['$.credentialSubject.biometric.id'],
                },
                {
                  path: ['$.credentialSubject.biometric.created'],
                },
                {
                  path: ['$.credentialSubject.biometric.data'],
                },
              ],
            },
          }
        ],
        submission_requirements: [
          {
            from: 'A',
            name: 'Multi Credential Request',
            rule: 'pick',
            count: 1,
          },
        ],
      },
      type: 'proof-request',
    };

    await controller.start({
      template: autoLoanProofRequest,
    });

    controller.selectedCredentials.set(biometricCredential.id, {
      credential: biometricCredential,
      attributesToReveal: ['credentialSubject.id'],
    });

    controller.selectedCredentials.set(creditScoreCredential.id, {
      credential: creditScoreCredential,
      attributesToReveal: [
        'credentialSubject.data',
        'credentialSubject.biometric.id',
        'credentialSubject.biometric.created',
      ],
    });

    controller.selectedCredentials.set(bankIdentityCredential.id, {
      credential: bankIdentityCredential,
      attributesToReveal: ['credentialSubject.id'],
    });

    // Unable to create presentations with current credit score credential
    // will need to generate a new one
    // and investigate why the old one is not valid anymore
    // const presentation = await controller.createPresentation();

    // const verificationResults = await credentialService.verifyPresentation({
    //   presentation,
    //   options: {
    //     compactProof: true,
    //     resolver: blockchainService.resolver,
    //     challenge: proofRequest.nonce,
    //     unsignedPresentation: true,
    //     domain: 'dock.io',
    //   },
    // });

    // TODO: Fix this test
    // expect(verificationResults.verified).toBe(true);
  });

  afterAll(() => closeWallet());
});
