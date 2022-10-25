import {renderHook} from '@testing-library/react-hooks';
import {useAccounts} from './accountsHooks';

jest.mock('./index.js', () => {
  let documents = [
    {
      '@context': ['https://w3id.org/wallet/v1'],
      id: 'urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002',
      type: 'Ed25519VerificationKey2018',
    },
    {
      '@context': ['https://w3id.org/wallet/v1'],
      id: 'e8fc7810-9524-11ea-bb37-0242ac130002',
      type: 'Address',
    },
    {
      '@context': ['https://w3id.org/wallet/v1'],
      id: 'urn:uuid:e8fc7810-9524-11ea-bb37-0242ac130002n',
      type: 'Ed25519VerificationKey2018',
    },
  ];

  const mockFunctions = {
    documents,
  };
  return {
    useWallet: jest.fn(() => {
      return mockFunctions;
    }),
    getAccount: jest.fn(() => {
      return {
        address: '',
        name: '',
        balance: '',
        correlation: '',
        mnemonic: '',
      };
    }),
  };
});

describe('Accounts  Hooks', () => {
  test('filter address documents', () => {
    const {result} = renderHook(() => useAccounts());
    expect(result.current.accounts.length).toBe(1);
    const singleAccount = result.current.accounts[0];
    expect(singleAccount.type).toBe('Address');
    expect(singleAccount).toHaveProperty('fetchBalance');
    expect(singleAccount).toHaveProperty('balance');
  });
});
