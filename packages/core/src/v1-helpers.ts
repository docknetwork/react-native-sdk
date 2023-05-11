// TODO: [wallet-sdk] Cleanup wallet-sdk unnused wasm services https://dock-team.atlassian.net/browse/DCKA-1658
import {IV1Wallet, IWallet} from './types';
import {createAccountProvider} from './account-provider';
import {WalletDocument} from '@docknetwork/wallet-sdk-data-store/src/types';
import * as walletServiceConfigs from '@docknetwork/wallet-sdk-wasm/lib/services/wallet/configs';
import {keyringService} from '@docknetwork/wallet-sdk-wasm/lib/services/keyring/index';
import {v4 as uuid} from 'uuid';
import {EventEmitter} from 'events';

function once(emitter: EventEmitter, eventName: string) {
  return new Promise(resolve => emitter.once(eventName, resolve));
}

export async function toV1Wallet(wallet: IWallet): Promise<IWallet> {
  const accounts = await createAccountProvider({
    wallet,
  });

  const eventEmitter = new EventEmitter();

  eventEmitter.once = (eventName: string) =>
    once(eventEmitter, eventName) as any;

  const v1Wallet = {
    eventManager: eventEmitter,
    accounts: accounts,
    create(json: any): Promise<WalletDocument> {
      return wallet.addDocument(document);
    },
    deleteWallet(): Promise<void> {
      return Promise.resolve(undefined);
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
    remove(id: string): Promise<void> {
      return wallet.removeDocument(id);
    },
    add(json: any): Promise<WalletDocument> {
      return wallet.addDocument(json);
    },
    resolveCorrelations(id: string): Promise<WalletDocument[]> {
      return wallet.getDocumentCorrelations(id);
    },
    sync(): Promise<void> {
      return Promise.resolve(undefined);
    },
    update(json: any): Promise<WalletDocument> {
      return wallet.updateDocument(document);
    },
    upsert(json: any): Promise<WalletDocument> {
      return wallet.upsertDocument(document);
    },
  };

  const newWallet = {
    ...v1Wallet,
    ...wallet,
  };

  accounts.wallet = newWallet;

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
      return wallet.getDocumentById(id);
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
    }) => {
      walletServiceConfigs.validation.createAccountDocuments(params);

      const {
        name,
        type = 'sr25519',
        derivePath,
        mnemonic,
        json,
        password,
      } = params;

      const keyringJson = json
        ? await keyringService.addFromJson({jsonData: json, password})
        : await keyringService.getKeyringPair({mnemonic, derivePath, type});
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

      const correlationsDocs = await Promise.all(
        correlations.map(doc => wallet.addDocument(doc)),
      );

      const addressDocument = await wallet.addDocument({
        '@context': ['https://w3id.org/wallet/v1'],
        id: keyringJson.address,
        type: 'Address',
        value: keyringJson.address,
        address: keyringJson.address,
        name,
        correlation: correlations.map(doc => doc.id),
      });

      return [addressDocument, ...correlationsDocs];
    },
  };
}
