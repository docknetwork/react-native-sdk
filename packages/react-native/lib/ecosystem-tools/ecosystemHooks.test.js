import { renderHook } from '@testing-library/react-hooks';
import { useEcosystems } from './ecosystemHooks';
import { getEcosystems, formatEcosystemData } from '@docknetwork/wallet-sdk-core/src/ecosystem-tools';
import { getWallet } from '../wallet';
import { captureException } from '@docknetwork/wallet-sdk-core/src/helpers';

jest.mock('@docknetwork/wallet-sdk-core/src/ecosystem-tools', () => ({
  getEcosystems: jest.fn(),
  formatEcosystemData: jest.fn(),
}));

jest.mock('../wallet', () => ({
  getWallet: jest.fn(),
}));

jest.mock('@docknetwork/wallet-sdk-core/src/helpers', () => ({
  captureException: jest.fn(),
}));

const mockEcosystems = {
  eco1: { govFramework: 'hex-url-1' },
  eco2: { govFramework: 'hex-url-2' },
};

const mockFormattedEcosystems = [
  { trustRegistryId: 'eco1', govFramework: 'hex-url-1', name: 'Ecosystem 1' },
  { trustRegistryId: 'eco2', govFramework: 'hex-url-2', name: 'Ecosystem 2' },
];

const mockWallet = {
  getNetworkId: jest.fn(() => 'test-network'),
};

getWallet.mockReturnValue(mockWallet);

describe('useEcosystems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and format ecosystem data', async () => {
    getEcosystems.mockResolvedValue(mockEcosystems);
    formatEcosystemData.mockResolvedValue(mockFormattedEcosystems);

    const { result, waitForNextUpdate } = renderHook(() =>
      useEcosystems({ issuer: 'issuerId', verifier: 'verifierId', schemaId: 'schemaId', networkId: 'test-network'})
    );

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(getEcosystems).toHaveBeenCalledWith({
      issuerDID: 'issuerId',
      verifierDID: 'verifierId',
      schemaId: 'schemaId',
      networkId: 'test-network',
    });

    expect(formatEcosystemData).toHaveBeenCalledWith(mockEcosystems);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.ecosystems).toEqual(mockFormattedEcosystems);
  });

  it('should handle error while fetching ecosystems', async () => {
    const error = new Error('Error fetching ecosystems');
    getEcosystems.mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() =>
      useEcosystems({ issuer: 'issuerId', verifier: 'verifierId', schemaId: 'schemaId' })
    );

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(captureException).toHaveBeenCalledWith(error);
  });
});
