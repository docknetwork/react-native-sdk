export const autoLoanProofRequest = {
  boundCheckSnarkKey:
  signature:
    'nsbOlyXSZj1Bss-ivAho0B_eezvpMOMf9fALgDXB-bNSoZmHVu14NOUgPBe0nK7hMHdmr1Q5f3-M-QOKjthgCQ',
  qr: 'https://creds-testnet.dock.io/proof/37ba730c-4b58-44d3-88cd-d4f5be32b698',
  id: '37ba730c-4b58-44d3-88cd-d4f5be32b698',
  name: 'Quotient Loan Verification - Bank Identity, Biometrics, and Credit Score',
  nonce: '625990',
  created: '2024-06-11T19:37:31.263Z',
  did: 'did:dock:5HKkVpaciu1RArV13E7ig3i84JtiMTcwoXoHPZ8VMrBUYJ4w',
  verifierName: 'Quotient Credit Union',
  verifierLogo: 'https://img.dock.io/06d78272268c606a172d5fd1cd559b46',
  response_url:
    'https://api-testnet.dock.io/proof-requests/37ba730c-4b58-44d3-88cd-d4f5be32b698/send-presentation',
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
      },
      {
        id: 'Credential 3',
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
                const: 'EquiNetCreditScore',
              },
              predicate: 'required',
            },
            {
              path: ['$.credentialSubject.credit_score'],
              filter: {
                type: 'number',
                minimum: 700,
              },
              predicate: 'required',
            },
          ],
        },
      },
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