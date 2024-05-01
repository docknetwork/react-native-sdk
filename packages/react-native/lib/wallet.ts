import {
  createCredentialProvider,
  ICredentialProvider,
} from '@docknetwork/wallet-sdk-core/src/credential-provider';
import {EventEmitter} from 'events';
import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/src/wallet';
import {dockDocumentNetworkResolver} from '@docknetwork/wallet-sdk-core/src/network-resolver';
import {DataStoreConfigs} from '@docknetwork/wallet-sdk-data-store/src/types';
import {
  createDIDProvider,
  IDIDProvider,
} from '@docknetwork/wallet-sdk-core/src/did-provider';
import {
  createMessageProvider,
  IMessageProvider,
} from '@docknetwork/wallet-sdk-core/src/message-provider';

let wallet: IWallet;
let didProvider: IDIDProvider;
let messageProvider: IMessageProvider;
let credentialProvider: ICredentialProvider;

export const WalletEvents = {
  walletInitialized: 'walletInitialized',
};

export const walletEventEmitter = new EventEmitter();

export function getWallet() {
  if (!wallet) {
    throw new Error('Wallet not initialized');
  }

  return wallet;
}

export function getMessageProvider() {
  if (!messageProvider) {
    throw new Error('Message provider not initialized');
  }

  return messageProvider;
}

export function getDIDProvider() {
  if (!didProvider) {
    throw new Error('DID provider not initialized');
  }

  return didProvider;
}

export function getCredentialProvider(): ICredentialProvider {
  if (!credentialProvider) {
    throw new Error('Credential provider not initialized');
  }

  return credentialProvider;
}

export function setWallet(_wallet: IWallet) {
  wallet = _wallet;
}

export function setDIDProvider(_didProvider: IDIDProvider) {
  didProvider = _didProvider;
}

export function setMessageProvider(_messageProvider: IMessageProvider) {
  messageProvider = _messageProvider;
}

export function setCredentialProvider(
  _credentialProvider: ICredentialProvider,
) {
  credentialProvider = _credentialProvider;
}

export async function getOrCreateWallet(params: DataStoreConfigs = {} as any) {
  if (!wallet) {
    await initializeWallet(params);
  }

  return wallet;
}

export const DEFAULT_WALLET_CONFIGS: any = {
  databasePath: 'dock-wallet',
  dbType: 'react-native',
  testNetworkId: 'testnet',
  mainNetworkId: 'mainnet',
  documentNetworkResolver: dockDocumentNetworkResolver,
};

export async function initializeWallet(params: DataStoreConfigs = {} as any) {
  const _wallet = await createWallet({
    ...DEFAULT_WALLET_CONFIGS,
    ...params,
  });

  setWallet(_wallet);

  const _didProvider = createDIDProvider({
    wallet: _wallet,
  });

  setDIDProvider(_didProvider);

  const _messageProvider = createMessageProvider({
    wallet: _wallet,
    didProvider: _didProvider,
  });

  setMessageProvider(_messageProvider);

  const _credentialProvider = createCredentialProvider({
    wallet: _wallet,
  });

  setCredentialProvider(_credentialProvider);

  walletEventEmitter.emit(WalletEvents.walletInitialized);

  return _wallet;
}
