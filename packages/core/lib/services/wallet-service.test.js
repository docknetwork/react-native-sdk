import Keyring, {KeyringPair} from '@polkadot/keyring';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import dock from '@docknetwork/sdk';
import ApiService from './api';
import DockService from './dock';
import WalletService, {getWallet} from './wallet';
import KeyringService, { getKeyring } from './keyring';
import {initializeWalletService} from './test-utils';

const mnemonic =
  'hole dog cross program hungry blue burst raccoon differ rookie pipe auction';

describe('ApiService', () => {
  beforeAll(async () => {
    await initializeWalletService();
  });

  describe('createAccountDocuments', () => {
    const params = {
      derivationPath: '',
      mnemonic,
      keyPairType: 'sr25519',
      name: 'Test account',
    };
    let documents;
    let correlation;

    beforeAll(async () => {
        documents = await WalletService.routes.createAccountDocuments(params);
        correlation = await WalletService.routes.resolveCorrelations(documents[0].id);
    });

    it('expect to create 3 documents', () => {
        expect(documents.length).toBe(3);
    });

    it('expect to create address document ', () => {
        const document = correlation.find(doc => doc.type === 'Address');
        expect(document.value).toBe(documents[0].id);
    });

    it('expect to create mnemonic document', () => {
        const document = correlation.find(doc => doc.type === 'Mnemonic');
        expect(document.value).toBe(params.mnemonic);
    });

    it('expect to create keyringPair document', () => {
        const document = correlation.find(doc => doc.type === 'KeyringPair');
        const keyringPairJson = document.value;
        const keyringPair = getKeyring().addFromJson(keyringPairJson);

        expect(keyringPair.address).toBe(documents[0].value);
        expect(keyringPair.type).toBe(params.keyPairType);
    });
  });
});
