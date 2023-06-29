import {pexService} from '../service.js';

describe('Pex Examples', () => {
  it('expect to filter credentials based on a minimum value numeric filter', () => {
    const credentials = [
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          {
            dk: 'https://ld.dock.io/credentials#',
            CustomerCredential: 'dk:CustomerCredential',
            name: 'dk:name',
            description: 'dk:description',
            logo: 'dk:logo',
          },
        ],
        id: 'https://creds-testnet.dock.io/6cae3640eddeeee199079ae42573d5b6a5e533a6d8570688157b93e71c960199',
        type: ['VerifiableCredential', 'CustomerCredential'],
        credentialSubject: {
          id: 'did:key:z6MkeYHpuyHZBsg5aAwQEdZ8UpJsHjYZ2iEqxaAYUANETSJJ',
          name: 'Alice Doe',
        },
        issuanceDate: '2023-06-29T17:07:21.851Z',
        issuer: {
          name: 'Test123',
          description: '',
          logo: '',
          id: 'did:dock:5CgR1iELH33Qm8CN7LLXiEdTnrPTFKHgdxZgTuDwxgiyokjB',
        },
        name: 'Customer Credential',
        proof: {
          type: 'Ed25519Signature2018',
          created: '2023-06-29T17:07:25Z',
          verificationMethod:
            'did:dock:5CgR1iELH33Qm8CN7LLXiEdTnrPTFKHgdxZgTuDwxgiyokjB#keys-1',
          proofPurpose: 'assertionMethod',
          jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..Xwak7kw1CnALO5i2oClXjflRsWxQlwCnKe4g25XXenUrFeci7GzUh01aikKoq8_N4949L6MsWejWgcRaFNoRCw',
        },
      },
      // {
      //   '@context': [
      //     'https://www.w3.org/2018/credentials/v1',
      //     {
      //       dk: 'https://ld.dock.io/credentials#',
      //       ProofOfAddress: 'dk:ProofOfAddress',
      //       address: 'dk:address',
      //       name: 'dk:name',
      //       description: 'dk:description',
      //       logo: 'dk:logo',
      //     },
      //   ],
      //   id: 'https://creds-testnet.dock.io/2a3fc78fb76ac479b8c6a1626fdf41e338fa0b6d0751b624c836c9679a596cfe',
      //   type: ['VerifiableCredential', 'ProofOfAddress'],
      //   credentialSubject: {
      //     id: 'did:key:z6MkeYHpuyHZBsg5aAwQEdZ8UpJsHjYZ2iEqxaAYUANETSJJ',
      //     address: '123 Main St',
      //   },
      //   issuanceDate: '2021-01-01T14:15:22Z',
      //   issuer: {
      //     name: 'Test123',
      //     description: '',
      //     logo: '',
      //     id: 'did:dock:5CgR1iELH33Qm8CN7LLXiEdTnrPTFKHgdxZgTuDwxgiyokjB',
      //   },
      //   name: 'Proof of Address',
      //   proof: {
      //     type: 'Ed25519Signature2018',
      //     created: '2023-06-29T17:07:24Z',
      //     verificationMethod:
      //       'did:dock:5CgR1iELH33Qm8CN7LLXiEdTnrPTFKHgdxZgTuDwxgiyokjB#keys-1',
      //     proofPurpose: 'assertionMethod',
      //     jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..SgJjImvzFMAYKPZ9SB1yll1jDFAy_6z7z1ZlKX7IX1VRJhAIVNWFp527DYJnWpd6OqInEqldT8YK7otnQmAVBA',
      //   },
      // },
    ];

    const presentationDefinition = {
      id: 'test',
      input_descriptors: [
        {
          id: 'CustomerCredentialProof',
          name: 'Customer Proof Request',
          purpose: 'Customer Credential with name, issued date requested',
          constraints: {
            fields: [
              {
                path: ['$.issuanceDate'],
              },
              {
                path: ['$.type[*]'],
                filter: {
                  type: 'string',
                  const: 'CustomerCredential',
                },
              },
            ],
          },
        },
        {
          id: 'ProofOfAddressProof',
          name: 'Proof Of Address Proof Request',
          purpose: 'Proof Of Address with address and issued date requested',
          constraints: {
            fields: [
              {
                path: ['$.issuanceDate'],
              },
              {
                path: ['$.type[*]'],
                filter: {
                  type: 'string',
                  const: 'ProofOfAddress',
                },
              },
            ],
          },
        },
      ],
    };

    const results = pexService.filterCredentials({
      credentials,
      presentationDefinition,
    });

    debugger;
    // expect(results.verifiableCredential).toBeTruthy();
    // expect(results.verifiableCredential.length).toBe(1);
  });
  it('expect to filter credentials based on a date range filter', () => {
    const credentials = [
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          {
            dk: 'https://ld.dock.io/credentials#',
            product1: 'dk:product1',
            price: 'dk:price',
            product2: 'dk:product2',
            product3: 'dk:product3',
            logo: 'dk:logo',
          },
        ],
        id: 'https://creds-testnet.dock.io/b2d23ad1236d41d953148d30e167af38d3099368bdcc36505485dc07f48b330d',
        type: ['VerifiableCredential', 'CommercialInvoiceSchema'],
        credentialSubject: {
          product1: {
            price: 200,
            release_date: '2000-07-29',
          },
          product2: {},
          product3: {},
        },
        issuanceDate: '2023-04-03T17:33:04.679Z',
        name: 'Should be included',
        issuer: {
          name: 'Test-Issuer',
          description: '',
          logo: '',
          id: 'did:dock:5H3jLBStH3zPH7ZfWFpfNHY8DMMTbVgqyTnsdQDk3v9xyXsX',
        },
        proof: {
          type: 'Ed25519Signature2018',
          created: '2023-05-19T18:19:17Z',
          verificationMethod:
            'did:dock:5H3jLBStH3zPH7ZfWFpfNHY8DMMTbVgqyTnsdQDk3v9xyXsX#keys-1',
          proofPurpose: 'assertionMethod',
          jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..wa8fFgdM-MHVCz1pG0Zfvg5mgy0zOU0v8g0i9kn2IPJcLZpMBTBbQlG0tuL01eYriF4mK6cBLXEMF6lbLtLwCg',
        },
      },
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          {
            dk: 'https://ld.dock.io/credentials#',
            product1: 'dk:product1',
            price: 'dk:price',
            product2: 'dk:product2',
            product3: 'dk:product3',
            logo: 'dk:logo',
          },
        ],
        id: 'https://creds-testnet.dock.io/b2d23ad1236d41d953148d30e167af38d3099368bdcc36505485dc07f48b330d',
        type: ['VerifiableCredential', 'CommercialInvoiceSchema'],
        credentialSubject: {
          product1: {
            price: 200,
            release_date: '2010-11-21',
          },
          product2: {},
          product3: {},
        },
        issuanceDate: '2023-04-03T17:33:04.679Z',
        name: 'Should be included',
        issuer: {
          name: 'Test-Issuer',
          description: '',
          logo: '',
          id: 'did:dock:5H3jLBStH3zPH7ZfWFpfNHY8DMMTbVgqyTnsdQDk3v9xyXsX',
        },
        proof: {
          type: 'Ed25519Signature2018',
          created: '2023-05-19T18:19:17Z',
          verificationMethod:
            'did:dock:5H3jLBStH3zPH7ZfWFpfNHY8DMMTbVgqyTnsdQDk3v9xyXsX#keys-1',
          proofPurpose: 'assertionMethod',
          jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..wa8fFgdM-MHVCz1pG0Zfvg5mgy0zOU0v8g0i9kn2IPJcLZpMBTBbQlG0tuL01eYriF4mK6cBLXEMF6lbLtLwCg',
        },
      },
      {
        '@context': [
          'https://www.w3.org/2018/credentials/v1',
          {
            dk: 'https://ld.dock.io/credentials#',
            product1: 'dk:product1',
            price: 'dk:price',
            product2: 'dk:product2',
            product3: 'dk:product3',
            logo: 'dk:logo',
          },
        ],
        id: 'https://creds-testnet.dock.io/b2d23ad1236d41d953148d30e167af38d3099368bdcc36505485dc07f48b330d',
        type: ['VerifiableCredential', 'CommercialInvoiceSchema'],
        credentialSubject: {
          product1: {
            price: 50,
            release_date: '1990-03-19',
          },
          product2: {},
          product3: {},
        },
        issuanceDate: '2023-04-03T17:33:04.679Z',
        name: 'Should be excluded',
        issuer: {
          name: 'Test-Issuer',
          description: '',
          logo: '',
          id: 'did:dock:5H3jLBStH3zPH7ZfWFpfNHY8DMMTbVgqyTnsdQDk3v9xyXsX',
        },
        proof: {
          type: 'Ed25519Signature2018',
          created: '2023-05-19T18:19:17Z',
          verificationMethod:
            'did:dock:5H3jLBStH3zPH7ZfWFpfNHY8DMMTbVgqyTnsdQDk3v9xyXsX#keys-1',
          proofPurpose: 'assertionMethod',
          jws: 'eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..wa8fFgdM-MHVCz1pG0Zfvg5mgy0zOU0v8g0i9kn2IPJcLZpMBTBbQlG0tuL01eYriF4mK6cBLXEMF6lbLtLwCg',
        },
      },
    ];

    const presentationDefinition = {
      id: 'income_test',
      input_descriptors: [
        {
          id: 'ProofIncome-Merit-7',
          name: 'Test - released between 1995 and 2005',
          purpose: 'Filter credentials based released date',
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.product1.release_date'],
                filter: {
                  type: 'string',
                  format: 'date',
                  formatMinimum: '1995-01-01',
                  formatMaximum: '2005-12-31',
                },
              },
            ],
          },
        },
      ],
    };

    const results = pexService.filterCredentials({
      credentials,
      presentationDefinition,
    });

    expect(results.verifiableCredential).toBeTruthy();
    expect(results.verifiableCredential.length).toBe(1);
  });
});
