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
            expiredDate: '2021-01-01',
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
            expiredDate: '2021-01-01',
          },
        ],
      )[0];

      expect(result).toEqual(['credentialSubject.id']);
    });
  });
});
