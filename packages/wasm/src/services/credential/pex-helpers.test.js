import {getPexRequiredAttributes, pexToBounds} from './pex-helpers';

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

  describe('pexToBounds', () => {
    it('should convert pexRequest to bounds with default values', () => {
      const pexRequest = {
        input_descriptors: [
          {
            constraints: {
              fields: [
                {
                  filter: {
                    type: 'number',
                    minimum: 0,
                  },
                  path: ['$.age'],
                },
                {
                  filter: {
                    format: 'date',
                    minimum: '2021-01-01',
                  },
                  path: ['$.dateOfBirth'],
                },
              ],
            },
          },
        ],
      };

      const bounds = pexToBounds(pexRequest);

      expect(bounds).toEqual([
        [
          {
            attributeName: 'age',
            min: 0,
            max: 1000000000000000000,
            type: 'number',
            format: undefined,
          },
          {
            attributeName: 'dateOfBirth',
            min: new Date('2021-01-01'),
            max: new Date(884541351600000),
            type: undefined,
            format: 'date',
          },
        ],
      ]);
    });

    it('should convert pexRequest to bounds with raw boundaries enabled', () => {
      const pexRequest = {
        input_descriptors: [
          {
            constraints: {
              fields: [
                {
                  filter: {
                    type: 'number',
                    minimum: 0,
                  },
                  path: ['$.age'],
                },
              ],
            },
          },
        ],
      };

      const bounds = pexToBounds(pexRequest, [], true);

      expect(bounds).toEqual([
        [
          {
            attributeName: 'age',
            min: 0,
            max: undefined,
            type: 'number',
            format: undefined,
          },
        ],
      ]);
    });
    it('should convert pexRequest to bounds for date-time format', () => {
      const pexRequest = {
        input_descriptors: [
          {
            constraints: {
              fields: [
                {
                  filter: {
                    format: 'date-time',
                    maximum: '2022-01-01T00:00:00Z',
                    minimum: '2021-01-01T00:00:00Z',
                  },
                  path: ['$.expirationDate'],
                },
              ],
            },
          },
        ],
      };

      const bounds = pexToBounds(pexRequest);

      expect(bounds).toEqual([
        [
          {
            attributeName: 'expirationDate',
            min: new Date('2021-01-01T00:00:00Z'),
            max: new Date('2022-01-01T00:00:00Z'),
            type: undefined,
            format: 'date-time',
          },
        ],
      ]);
    });

    it('should convert pexRequest to bounds for number format', () => {
      const pexRequest = {
        input_descriptors: [
          {
            constraints: {
              fields: [
                {
                  filter: {
                    type: 'number',
                    maximum: 100,
                    minimum: 0,
                  },
                  path: ['$.amount'],
                },
              ],
            },
          },
        ],
      };

      const bounds = pexToBounds(pexRequest);

      expect(bounds).toEqual([
        [
          {
            attributeName: 'amount',
            min: 0,
            max: 100,
            type: 'number',
            format: undefined,
          },
        ],
      ]);
    });

    it('should convert pexRequest to bounds for multiple fields', () => {
      const pexRequest = {
        input_descriptors: [
          {
            constraints: {
              fields: [
                {
                  filter: {
                    format: 'date',
                    maximum: '2022-01-01',
                    minimum: '2021-01-01',
                  },
                  path: ['$.startDate'],
                },
                {
                  filter: {
                    type: 'number',
                    maximum: 100,
                    minimum: 0,
                  },
                  path: ['$.amount'],
                },
              ],
            },
          },
        ],
      };

      const bounds = pexToBounds(pexRequest);

      expect(bounds).toEqual([
        [
          {
            attributeName: 'startDate',
            min: new Date('2021-01-01'),
            max: new Date('2022-01-01'),
            type: undefined,
            format: 'date',
          },
          {
            attributeName: 'amount',
            min: 0,
            max: 100,
            type: 'number',
            format: undefined,
          },
        ],
      ]);
    });

    it('should handle empty pexRequest', () => {
      const pexRequest = {
        input_descriptors: [],
      };

      const bounds = pexToBounds(pexRequest);

      expect(bounds).toEqual([]);
    });
  });
});
