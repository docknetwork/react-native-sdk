import {mnemonicGenerate} from '@polkadot/util-crypto';
import {NetworkManager} from '../../modules/network-manager';
import {keyringService} from '../keyring/service';
import {assertRpcService, getPromiseError} from '../test-utils';
import {validation} from './configs';
import {walletService as service, walletService} from './service';
import {WalletServiceRpc} from './service-rpc';

describe('WalletService', () => {
  it('ServiceRpc', () => {
    assertRpcService(WalletServiceRpc, service, validation);
  });

  let accountDocuments;
  let testAccount;

  describe('service', () => {
    beforeAll(async () => {
      await keyringService.initialize({
        ss58Format: NetworkManager.getInstance().getNetworkInfo().addressPrefix,
      });
      await service.create({
        walletId: 'test',
        type: 'memory',
      });
      await service.load();
      await service.sync();
      accountDocuments = await service.createAccountDocuments({
        mnemonic: mnemonicGenerate(12),
        name: 'test',
        type: 'sr25519',
      });

      testAccount = accountDocuments[0];
    });

    describe('getDocumentById', () => {
      it('expect to sum numbers', async () => {
        const result = await service.getDocumentById(testAccount.id);
        expect(result.id).toBe(testAccount.id);
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() =>
          service.getDocumentById(null),
        );

        expect(error.message).toBe('invalid documentId');
      });
    });

    describe('getAccountKeypair', () => {
      it('expect to get account keypair', async () => {
        const result = await service.getAccountKeypair(testAccount.id);
        expect(result.address).toBe(testAccount.id);
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() =>
          service.getDocumentById(null),
        );

        expect(error.message).toBe('invalid documentId');
      });
    });

    describe('createAccountDocuments', () => {
      const params = {
        derivationPath: '',
        mnemonic: mnemonicGenerate(12),
        type: 'sr25519',
        name: 'Test account',
      };
      let documents;
      let correlation;

      beforeAll(async () => {
        documents = await service.createAccountDocuments(params);
        correlation = await service.resolveCorrelations(documents[0].id);
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
        const keyringPair = keyringService.addFromJson({
          jsonData: keyringPairJson,
          password: '',
        });

        expect(keyringPair.address).toBe(documents[0].value);
        expect(keyringPair.type).toBe(params.type);
      });

      it('expect to create DOCK currency document', () => {
        const document = correlation.find(doc => doc.type === 'Currency');
        expect(document.value).toBe(0);
        expect(document.symbol).toBe('DOCK');
      });
    });

    describe('exportAccount', () => {
      it('expect to export account', async () => {
        const result = await service.exportAccount({
          address: testAccount.id,
          password: '123',
        });
        expect(result.address).toBe(testAccount.id);
        const pair = keyringService.addFromJson({
          jsonData: result,
          password: '123',
        });
        expect(pair.address).toBe(testAccount.id);
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() =>
          service.exportAccount({
            address: undefined,
            password: null,
          }),
        );
        expect(error.message).toBe('invalid address: undefined');
      });
    });

    describe('exportWallet', () => {
      it('expect to export account', async () => {
        const result = await service.exportWallet('123');
        expect(result.id).toBeDefined();
        expect(result['@context']).toBeDefined();
        expect(result.type).toBeDefined();
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() =>
          service.exportWallet(undefined),
        );
        expect(error.message).toBe('invalid password: undefined');
      });
    });

    describe('importWallet', () => {
      it('expect to export account', async () => {
        const json = await service.exportWallet('123');
        await walletService.removeAll();
        await service.importWallet({json, password: '123'});
        for (let doc of accountDocuments) {
          const walletDoc = await walletService.getDocumentById(doc.id);
          expect(walletDoc).toStrictEqual(doc);
        }
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() =>
          service.importWallet({json: undefined}),
        );
        expect(error.message).toBe('invalid json data: undefined');
      });
    });
  });
});
