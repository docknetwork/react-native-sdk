import {getPexRequiredAttributes} from './pex-helpers';

describe('pex helpers', () => {
  describe('getPexRequiredAttributes', () => {
    it('should reveal expiredDate and subject.id', () => {
      const result = getPexRequiredAttributes(
        {
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
        [
          {
            expirationDate: '2021-01-01',
            credentialSubject: {
              id: '123',
            },
          },
        ],
      )[0];

      expect(result).toEqual(['credentialSubject.id', 'expirationDate']);
    });

    it('should not reveal range proof fields', () => {
      const result = getPexRequiredAttributes(
        {
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
                    filter: {
                      type: 'range',
                      max: 100,
                      min: 0,
                    },
                  },
                ],
              },
            },
          ],
        },
        [
          {
            expirationDate: '2021-01-01',
            credentialSubject: {
              id: '123',
            },
          },
        ],
      )[0];

      expect(result).toEqual(['credentialSubject.id']);
    });

    it('should work for multi credential request', () => {
      const result = getPexRequiredAttributes(
        {
          id: '0ed327d6-bea4-4524-a620-7ad2550c5625',
          input_descriptors: [
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
        [
          {
            expirationDate: '2021-01-01',
            credentialSubject: {
              id: 'someId',
              biometric: {
                created: '2021-01-01',
                data: '123',
                id: '123',
              },
            },
          },
        ],
      );

      expect(result[0]).toStrictEqual([
        'credentialSubject.id',
        'credentialSubject.biometric.id',
        'credentialSubject.biometric.created',
        'credentialSubject.biometric.data',
      ]);
      expect(result.length).toBe(1);
    });
  });
});
