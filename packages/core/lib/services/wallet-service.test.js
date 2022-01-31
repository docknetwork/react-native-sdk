import {getKeyring} from './keyring';
import {initializeWalletService} from './test-utils';
import WalletService from './wallet';

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
      correlation = await WalletService.routes.resolveCorrelations(
        documents[0].id,
      );
    });

    it('expect to create 4 documents', () => {
      expect(documents.length).toBe(4);
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

    it('expect to create DOCK currency document', () => {
      const document = correlation.find(doc => doc.type === 'Currency');
      expect(document.value).toBe(0);
      expect(document.symbol).toBe('DOCK');
    });
  });
});
