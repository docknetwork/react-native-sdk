import {pexService} from '../service.js';

describe('Pex Examples', () => {
  it('expect to filter credentials based on a minimum value numeric filter', () => {
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
          name: 'Test price over 100',
          purpose: 'Provedegree',
          constraints: {
            fields: [
              {
                path: ['$.credentialSubject.product1.price'],
                filter: {
                  type: 'number',
                  minimum: 100,
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
