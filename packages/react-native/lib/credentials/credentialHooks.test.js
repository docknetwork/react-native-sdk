import {renderHook} from '@testing-library/react-hooks';
import {
  useCredentialUtils,
  sortByIssuanceDate,
  getCredentialTimestamp,
  getCredentialStatus,
  isInThePast,
  CREDENTIAL_STATUS,
  cachedCredentialStatus,
  useGetCredentialStatus,
  waitFor,
} from './credentialHooks';
import {useWallet} from '../index';
import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';
import {dockService} from '@docknetwork/wallet-sdk-wasm/src/services/dock';

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

jest.mock('../index.js', () => {
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
  };
});
describe('Credential Hooks', () => {
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
  it('expect not to save credential with no id', async () => {
    const {result} = renderHook(() => useCredentialUtils());

    await expect(
      result.current.saveCredential({
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'UniversityDegreeCredential'],
        issuer: {
          id: 'did:dock:5CJaTP2eGCLf5ZNPUXYbWxUvJQMTseKfc4hi8WVBC1K8eW9N',
        },
      }),
    ).rejects.toThrowError('Credential has no ID');
  });
  it('expect not to save credential with no context', async () => {
    const {result} = renderHook(() => useCredentialUtils());

    await expect(
      result.current.saveCredential({
        id: 'https://creds.dock.io/8e02c35ae370b02f47d7faaf41cb1386768fc75c9fca7caa6bb389dbe61260eb',
        type: ['VerifiableCredential', 'UniversityDegreeCredential'],
        issuer: {
          id: 'did:dock:5CJaTP2eGCLf5ZNPUXYbWxUvJQMTseKfc4hi8WVBC1K8eW9N',
        },
      }),
    ).rejects.toThrowError('Credential has no context');
  });
  it('expect not to save credential with an invalid type', async () => {
    const {result} = renderHook(() => useCredentialUtils());

    await expect(
      result.current.saveCredential({
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'https://creds.dock.io/8e02c35ae370b02f47d7faaf41cb1386768fc75c9fca7caa6bb389dbe61260eb',
        type: ['UniversityDegreeCredential'],
        issuer: {
          id: 'did:dock:5CJaTP2eGCLf5ZNPUXYbWxUvJQMTseKfc4hi8WVBC1K8eW9N',
        },
      }),
    ).rejects.toThrowError('Credential has an invalid type');
  });
  it('expect not to save credential with duplicate id', async () => {
    const {result} = renderHook(() => useCredentialUtils());

    await expect(
      result.current.saveCredential({
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'https://creds.dock.io/8e02c35ae370b02f47d7faaf41cb1386768fc75c9fca7caa6bb389dbe61260eb',
        type: ['VerifiableCredential', 'UniversityDegreeCredential'],
        credentialSubject: {},
        issuanceDate: '2022-06-27T12:08:30.675Z',
        expirationDate: '2029-06-26T23:00:00.000Z',
        issuer: 'did:dock:5CJaTP2eGCLf5ZNPUXYbWxUvJQMTseKfc4hi8WVBC1K8eW9N',
      }),
    ).rejects.toThrowError('This credential already exists in the wallet');
  });
  it('expect to save credential', async () => {
    const {result} = renderHook(() => useCredentialUtils());
    const {result: walletResult} = renderHook(() => useWallet());
    await result.current.saveCredential({
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'https://creds.dock.io/8e02c35ae370b02f47d7faaf41cb1386768fc75c9fca7caa6bb389dbe61260e',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      credentialSubject: {},
      issuanceDate: '2022-06-27T12:08:30.675Z',
      expirationDate: '2029-06-26T23:00:00.000Z',
      issuer: 'did:dock:5CJaTP2eGCLf5ZNPUXYbWxUvJQMTseKfc4hi8WVBC1K8eW9N',
    });
    expect(walletResult.current.wallet.add).toHaveBeenCalledWith({
      value: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'https://creds.dock.io/8e02c35ae370b02f47d7faaf41cb1386768fc75c9fca7caa6bb389dbe61260e',
        type: ['VerifiableCredential', 'UniversityDegreeCredential'],
        credentialSubject: {},
        issuanceDate: '2022-06-27T12:08:30.675Z',
        expirationDate: '2029-06-26T23:00:00.000Z',
        issuer: 'did:dock:5CJaTP2eGCLf5ZNPUXYbWxUvJQMTseKfc4hi8WVBC1K8eW9N',
      },
      type: 'VerifiableCredential',
    });
  });
  test('Delete Credential', async () => {
    const {result} = renderHook(() => useCredentialUtils());
    const {result: walletResult} = renderHook(() => useWallet());

    await result.current.deleteCredential(
      'e8fc7810-9524-11ea-bb37-0242ac130002',
    );
    expect(walletResult.current.wallet.remove).toBeCalledWith(
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
describe('Credential Utils', () => {
  it('expect rpc function for verifying credential to be called', async () => {
    const isApiConnectedMock = jest
      .spyOn(dockService, 'isApiConnected')
      .mockReturnValue(true);
    await getCredentialStatus(mockCreds[0]);
    expect(credentialServiceRPC.verifyCredential).toHaveBeenCalledWith({
      credential: mockCreds[0],
    });

    isApiConnectedMock.mockRestore();
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
  it('check when credential has expired', () => {
    expect(isInThePast(new Date('2022-01-25'))).toBeTruthy();
    expect(isInThePast(new Date())).toBeFalsy();
  });
  it('expect to get expired credential status', async () => {
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'https://creds.dock.io/8e02c35ae370b02f47d7faaf41cb1386768fc75c9fca7caa6bb389dbe61260eb',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      credentialSubject: {},
      issuanceDate: '2022-06-27T12:08:30.675Z',
      expirationDate: '2019-06-26T23:00:00.000Z',
      issuer: {
        name: 'John Doe',
        description: '',
        logo: '',
        id: 'did:dock:5CJaTP2eGCLf5ZNPUXYbWxUvJQMTseKfc4hi8WVBC1K8eW9N',
      },
    };
    const response = await getCredentialStatus(credential);
    expect(response.status).toBe(CREDENTIAL_STATUS.EXPIRED);
  });
  it('expect to get revoked credential status', async () => {
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'https://creds.dock.io/8e02c35ae370b02f47d7faaf41cb1386768fc75c9fca7caa6bb389dbe61260eb',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      credentialSubject: {},
      issuanceDate: '2022-06-27T12:08:30.675Z',
      expirationDate: '2029-06-26T23:00:00.000Z',
      issuer: {
        name: 'John Doe',
        description: '',
        logo: '',
        id: 'did:dock:5CJaTP2eGCLf5ZNPUXYbWxUvJQMTseKfc4hi8WVBC1K8eW9N',
      },
    };
    const response = await getCredentialStatus(credential);
    expect(response.status).toBe(CREDENTIAL_STATUS.REVOKED);
  });

  it('expect to cache credential verification result', async () => {
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'https://creds.dock.io/8e02c35ae370b02f47d7faaf41cb1386768fc75c9fca7caa6bb389dbe61260eb',
      type: ['VerifiableCredential', 'UniversityDegreeCredential'],
      credentialSubject: {},
      issuanceDate: '2022-06-27T12:08:30.675Z',
      expirationDate: '2029-06-26T23:00:00.000Z',
      issuer: {
        name: 'John Doe',
        description: '',
        logo: '',
        id: 'did:dock:5CJaTP2eGCLf5ZNPUXYbWxUvJQMTseKfc4hi8WVBC1K8eW9N',
      },
    };
    const {result, waitForNextUpdate} = renderHook(() =>
      useGetCredentialStatus({credential}),
    );

    await waitForNextUpdate();

    expect(cachedCredentialStatus[credential.id]).toBeDefined();
    expect(result.current.status).toBe(CREDENTIAL_STATUS.REVOKED);
  });

  describe('waitFor', () => {
    it('expect to wait for condition to be true', async () => {
      const condition = () => true;
      const result = await waitFor(condition, 1000);
      expect(result).toBeTruthy();
    });
    it('expect to throw timeout error', async () => {
      const condition = () => false;

      await expect(waitFor(condition, 1000)).rejects.toThrowError('Timed out');
    });
  });
});
