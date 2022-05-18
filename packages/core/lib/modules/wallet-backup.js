import assert from 'assert';
import {walletService} from '../services/wallet/service';

export const invalidFileMessage = 'Invalid backup file';
export const noDocumentsFound = 'No documents found';
export const noAccountsFound = 'No accounts found';

export class WalletBackup {
  async validate(data, password) {
    assert(!!data.credentialSubject, invalidFileMessage);

    await walletService.importWallet({json: data, password});

    const docs = await walletService.query({});


    if (docs.length === 0) {
      throw new Error(noDocumentsFound);
    }

    const accounts = docs.filter(doc => doc.type === 'Account');

    if (accounts.length === 0) {
      throw new Error(noAccountsFound);
    }

    const warnings = [];

    for (let account of accounts) {
      const correlationDocs = account.correlation.map(docId =>
        docs.find(doc => doc.id === docId),
      );
      const hasMnemonic = correlationDocs.find(doc => doc.type === 'Mnemonic');
      const hasKeyPair = correlationDocs.find(doc => doc.type === 'KeyPair');

      if (!hasMnemonic && !hasKeyPair) {
        warnings.push(`keypair not found for account ${account.id}`);

        await walletService.update({
          ...account,
          meta: {
            ...account.meta,
            readOnly: true,
            keypairNotFoundWarning: true,
          },
        });
      }
    }

    return {
      accounts,
      warnings,
      docs,
    };
  }

  static getInstance(): WalletBackup {
    if (!WalletBackup.instance) {
      WalletBackup.instance = new WalletBackup();
    }

    return WalletBackup.instance;
  }
}
