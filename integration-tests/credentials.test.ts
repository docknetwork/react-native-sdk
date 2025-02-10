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
import {
  cleanup,
  closeWallet,
  createNewWallet,
  getCredentialProvider,
  getWallet,
  setupEnvironent,
} from './helpers';
import {credentialService} from '@docknetwork/wallet-sdk-wasm/src/services/credential/service';
import {IWallet} from '@docknetwork/wallet-sdk-core/src/types';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/src/modules/wallet';
import {API_MOCK_DISABLED} from '@docknetwork/wallet-sdk-wasm/src/services/test-utils';
import axios from 'axios';
import {test} from '@docknetwork/wallet-sdk-wasm/src/services/blockchain/revocation';
import {CheqdRevocationCredential} from './data/credentials/cheqd-credentials';

const allCredentials = [
  BasicCredential,
  UniversityDegreeCredential,
  UniversityDegreeCredentialBBS,
  PolygonIDCredential,
];

describe('Credentials', () => {
  let wallet;
  beforeAll(async () => {
    await cleanup();
    wallet = await getWallet();
  });

  it('expect to import credentials', async () => {
    for (const credentialJSON of allCredentials) {
      await importCredentialJSON(credentialJSON);
      const credential = await getCredentialById(credentialJSON.id);
      expect(credential).toBeDefined();
    }
  });

  describe('credential status', () => {
    it('should get status of bbs revokable credential', async () => {
      const credentialUrl =
        'https://creds-testnet.truvera.io/317c361641e7311663329a7fffff13a14f161832a9590acfd5d80a966c1615eb';
      const password = 'test';
      const {data: credential} = await axios.get(
        `${credentialUrl}?p=${btoa(password)}`,
      );

      await getCredentialProvider().addCredential(credential);

      const result: any = await getCredentialProvider().isValid(credential);

      expect(result.status).toBe('verified');
    });

    it('should get status of bbs revokable credential', async () => {
      await getCredentialProvider().addCredential(CheqdRevocationCredential);

      const result: any = await getCredentialProvider().isValid(
        CheqdRevocationCredential,
      );

      expect(result.status).toBe('verified');
    });
  });

  afterAll(() => closeWallet());
});
