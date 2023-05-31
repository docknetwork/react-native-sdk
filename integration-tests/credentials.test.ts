import {
  getCredentialById,
  importCredentialJSON,
} from './helpers/credential-helpers';
import {
  BasicCredential,
  PolygonIDCredential,
  UniversityDegreeCredential,
  UniversityDegreeCredentialBBS,
  BasicCredentialMainnet,
  UniversityDegreeTestnet,
} from './data/credentials';
import {cleanup, createNewWallet, getWallet, setupEnvironent} from './helpers';
import {credentialService} from '@docknetwork/wallet-sdk-wasm/lib/services/credential/service';
import {IWallet} from '@docknetwork/wallet-sdk-core/src/types';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/lib/modules/wallet';
import {API_MOCK_DISABLED} from "@docknetwork/wallet-sdk-wasm/lib/services/test-utils";

const allCredentials = [
  BasicCredential,
  UniversityDegreeCredential,
  UniversityDegreeCredentialBBS,
  PolygonIDCredential,
];

describe('Credentials', () => {
  beforeEach(async () => {
    await cleanup();
    await setupEnvironent();
    await createNewWallet();
  });

  it('expect to import credentials', async () => {
    for (const credentialJSON of allCredentials) {
      await importCredentialJSON(credentialJSON);
      const credential = await getCredentialById(credentialJSON.id);
      expect(credential).toBeDefined();
    }
  });

  describe('credential status', () => {
    it('expect testnet credential to have "Valid" status', async () => {
      // There is a ticket to remove the API mock and spinup a substrate node for integration tests in CI
      // For now these tests can be used for local testing, as it depends on the live APIs
      if (!API_MOCK_DISABLED) {
        return;
      }

      await getWallet().setNetwork('testnet');
      const result = await credentialService.verifyCredential({
        credential: UniversityDegreeTestnet,
      });

      expect(result.verified).toBeTruthy();
    });

    it('expect mainnet credential to have "Invalid" status on tesnet', async () => {
      if (!API_MOCK_DISABLED) {
        return;
      }

      await getWallet().setNetwork('testnet');
      const result = await credentialService.verifyCredential({
        credential: BasicCredentialMainnet,
      });

      expect(result.verified).toBeFalsy();
    });

    it('expect to switch network from testnet to mainnet and get valid status on mainnet credential', async () => {
      if (!API_MOCK_DISABLED) {
        return;
      }

      const wallet: IWallet = getWallet();
      // the default network is testnet
      // switch to mainnet
      await wallet.setNetwork('mainnet');

      // Wait for network to be updated
      await new Promise(resolve => {
        wallet.eventManager.on(WalletEvents.networkConnected, resolve);
      });

      const result = await credentialService.verifyCredential({
        credential: BasicCredentialMainnet,
      });

      expect(result.verified).toBeTruthy();
    });
  });
});
