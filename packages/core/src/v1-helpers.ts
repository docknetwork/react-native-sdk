// TODO: [wallet-sdk] Cleanup wallet-sdk unnused wasm services https://dock-team.atlassian.net/browse/DCKA-1658
import {IV1Wallet, IWallet} from './types';
import {createAccountProvider} from './account-provider';
import {WalletDocument} from '@docknetwork/wallet-sdk-data-store/src/types';
import * as walletServiceConfigs from '@docknetwork/wallet-sdk-wasm/src/services/wallet/configs';
import {keyringService} from '@docknetwork/wallet-sdk-wasm/src/services/keyring/index';
import {walletService} from '@docknetwork/wallet-sdk-wasm/src/services/wallet';
import {v4 as uuid} from 'uuid';
import {EventEmitter} from 'events';

export async function toV1Wallet(wallet: IWallet): Promise<IWallet> {
  const accounts = await createAccountProvider({
    wallet,
  });

  const v1Wallet = {
    accounts: accounts,
    create(json: any): Promise<WalletDocument> {
      return wallet.addDocument(document);
    },
    deleteWallet(): Promise<void> {
      return wallet.deleteWallet();
    },
    exportDocuments: (params: {documents: any}) => {
      return walletService.exportDocuments(params);
    },
    ensureNetwork(): Promise<void> {
      return Promise.resolve(undefined);
    },
    async query({
      id,
      type,
    }: {id?: string; type?: string} | undefined): Promise<WalletDocument[]> {
      if (id) {
        return [await wallet.getDocumentById(id)].filter(item => !!item);
      }

      if (type) {
        return wallet.getDocumentsByType(type);
      }

      return wallet.getAllDocuments();
    },
    remove(id: string, options: any): Promise<void> {
      return wallet.removeDocument(id);
    },
    add(json: any, options): Promise<WalletDocument> {
      return wallet.addDocument(json, options);
    },
    resolveCorrelations(id: string): Promise<WalletDocument[]> {
      return wallet.getDocumentCorrelations(id);
    },
    sync(): Promise<void> {
      return Promise.resolve(undefined);
    },
    update(json: any, options): Promise<WalletDocument> {
      return wallet.updateDocument(json, options);
    },
    upsert(json: any): Promise<WalletDocument> {
      return wallet.upsertDocument(json);
    },
  };

  const newWallet = {
    ...v1Wallet,
    ...wallet,
  };

  (accounts as any).wallet = newWallet;

  return newWallet;
}

export type KeypairType = 'sr25519' | 'ed25519' | 'ecdsa';

/**
 * Wallet service methods
 * @param wallet
 */
export function toV1WalletService(wallet: IWallet) {
  return {
    getDocumentById: id => {
      return wallet.dataStore.documents.getDocumentById(id);
    },
    // accounts are not required in a wallet
    // Ideally should move this code to the accounts provider file
    // and make account provider available on its own package
    createAccountDocuments: async (params: {
      name: string;
      json?: string;
      password?: string;
      mnemonic?: string;
      type?: KeypairType;
      derivePath?: string;
      hasBackup?: boolean;
    }) => {
      walletServiceConfigs.validation.createAccountDocuments(params);

      const {
        name,
        type = 'sr25519',
        derivePath,
        mnemonic,
        json,
        password,
        hasBackup
      } = params;

      const keyringJson = json
        ? await keyringService.addFromJson({jsonData: json, password})
        : await keyringService.getKeyringPairJSON({mnemonic, derivePath, type});
      const correlations: any[] = [];

      correlations.push({
        '@context': ['https://w3id.org/wallet/v1'],
        id: uuid(),
        type: 'KeyringPair',
        value: keyringJson,
      });

      correlations.push({
        '@context': ['https://w3id.org/wallet/v1'],
        id: uuid(),
        type: 'Currency',
        value: 0,
        symbol: 'DOCK',
      });

      if (mnemonic) {
        correlations.push({
          '@context': ['https://w3id.org/wallet/v1'],
          id: uuid(),
          type: 'Mnemonic',
          value: mnemonic,
        });
      }

      const correlationsDocs = [];

      for (let i = 0; i < correlations.length; i++) {
        const doc = correlations[i];
        const addedDoc = await wallet.addDocument(doc);
        correlationsDocs.push(addedDoc);
      }

      const addressDocument = await wallet.addDocument({
        '@context': ['https://w3id.org/wallet/v1'],
        id: keyringJson.address,
        type: 'Address',
        value: keyringJson.address,
        address: keyringJson.address,
        name,
        hasBackup,
        correlation: correlations.map(doc => doc.id),
      });

      return [addressDocument, ...correlationsDocs];
    },
  };
}
