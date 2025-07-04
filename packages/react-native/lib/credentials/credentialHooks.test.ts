import {renderHook} from '@testing-library/react-hooks';
import {
  useCredentialUtils,
  sortByIssuanceDate,
  getCredentialTimestamp,
  waitFor,
} from './credentialHooks';
import {useWallet} from '../index';

jest.mock('@docknetwork/wallet-sdk-wasm/src/services/credential', () => {
  const originalModule = jest.requireActual(
    '@docknetwork/wallet-sdk-wasm/src/services/credential',
  );
  const mockFunctions = {
    verifyCredential: jest.fn(credential => {
      return {verified: false, error: 'Revocation check failed'};
    }),
  };

  return {
    ...originalModule,
    credentialServiceRPC: mockFunctions,
  };
});
const mockCreds = [
  {
    id: 1,
    issuanceDate: '2022-03-25T10:28:18.848Z',
  },
  {
    id: 0,
    issuanceDate: '2023-03-25T10:28:18.848Z',
  },
  {
    id: 2,
    issuanceDate: '2020-03-25T10:28:18.848Z',
  },
  {
    id: 3,
    issuanceDate: null,
  },
];

const mockRemove = jest.fn();
jest.mock('../wallet', () => ({
  getWallet: jest.fn(() => ({
    remove: mockRemove,
  })),
  getCredentialProvider: jest.fn(() => ({
    getById: jest.fn(),
    getCredentialStatus: jest.fn(),
  })),
}));

jest.mock('../index.tsx', () => {
  let documents = [
    {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'https://creds.dock.io/8e02c35ae370b02f47d7faaf41cb1386768fc75c9fca7caa6bb389dbe61260eb',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      credentialSubject: {},
      issuanceDate: '2022-06-27T12:08:30.675Z',
      expirationDate: '2029-06-26T23:00:00.000Z',
      issuer: 'did:dock:5CJaTP2eGCLf5ZNPUXYbWxUvJQMTseKfc4hi8WVBC1K8eW9N',
    },
  ];

  const mockFunctions = {
    wallet: {
      add: jest.fn(doc => {
        documents.push(doc);
      }),

      update: jest.fn(doc => {
        documents.forEach((singleDocument, index) => {
          if (doc.id === singleDocument.id) {
            documents[index] = doc;
          }
        });
      }),
      remove: jest.fn(documentId => {
        documents = documents.filter(doc => {
          return doc.id !== documentId;
        });
      }),
    },
    documents,
  };
  return {
    useWallet: jest.fn(() => {
      return mockFunctions;
    }),
    useDocument: jest.fn(() => null),
    useDocuments: jest.fn(() => ({
      documents: mockFunctions.documents,
      loading: false,
    })),
  };
});
describe('Credential Hooks', () => {
  beforeEach(() => {
    mockRemove.mockClear();
  });

  test('Filter credentials list', () => {
    const {result} = renderHook(() => useCredentialUtils());
    expect(result.current.credentials.length).toBe(1);
    expect(result.current.credentials[0].type).toEqual(
      expect.arrayContaining([
        'VerifiableCredential',
        'UniversityDegreeCredential',
      ]),
    );
  });
  it('expect not to add duplicated credential', () => {
    const {result} = renderHook(() => useCredentialUtils());
    const allCredentials = mockCreds.map(m => {
      return m;
    });
    expect(
      result.current.doesCredentialExist(allCredentials, mockCreds[0]),
    ).toBeTruthy();
    expect(
      result.current.doesCredentialExist(allCredentials, {
        id: '10a2ed6eae550f6e1b456777de5ed27fdadd2e6ef1f6081e981918735e1d8f92',
      }),
    ).toBeFalsy();
  });
  test('Delete Credential', async () => {
    const {result} = renderHook(() => useCredentialUtils());

    await result.current.deleteCredential(
      'e8fc7810-9524-11ea-bb37-0242ac130002',
    );
    expect(mockRemove).toBeCalledWith(
      'e8fc7810-9524-11ea-bb37-0242ac130002',
    );
  });
  test('Delete Credential with invalid params', async () => {
    const {result} = renderHook(() => useCredentialUtils());
    await expect(result.current.deleteCredential()).rejects.toThrowError(
      'Credential ID is not set',
    );
  });
});

describe('getCredentialTimestamp', () => {
  it('expect to get credential timestamp', () => {
    expect(
      getCredentialTimestamp({
        issuanceDate: '2022-03-25T10:28:18.848Z',
      }),
    ).toEqual(1648204098848);
  });

  it('expect handle invalid issuanceDate', () => {
    expect(
      getCredentialTimestamp({
        issuanceDate: 'invalid date',
      }),
    ).toEqual(0);

    expect(
      getCredentialTimestamp({
        issuanceDate: null,
      }),
    ).toEqual(0);
  });

  it('expect throw for invalid credential', () => {
    expect(() => getCredentialTimestamp(null)).toThrowError();
  });
});
describe('sortByIssuanceDate', () => {
  it('expect to sort credentials', () => {
    const result = mockCreds
      .map(cred => ({...cred, content: cred}))
      .sort(sortByIssuanceDate);

    result.forEach((item, idx) => expect(item.id).toEqual(idx));
  });
});
