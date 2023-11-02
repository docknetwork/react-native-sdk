import {setStorage} from '@docknetwork/wallet-sdk-wasm/src/core/storage';
import {
  Wallet,
  WalletEvents,
} from '@docknetwork/wallet-sdk-wasm/src/modules/wallet';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Platform, View} from 'react-native';
import WebView from 'react-native-webview';
import {WebviewEventHandler} from './message-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AccountDetails} from '@docknetwork/wallet-sdk-wasm/src/modules/account';
import {DocumentType} from '@docknetwork/wallet-sdk-wasm/src/types';
import './rn-rpc-server';
import {useDIDManagement, useDIDUtils} from './didHooks';
import {useAccounts} from './accountsHooks';
import {
  useCredentialUtils,
  getCredentialStatus,
  useGetCredentialStatus,
  CREDENTIAL_STATUS,
} from './credentials/credentialHooks';
import {getOrCreateWallet} from './wallet';
import debounce from 'lodash.debounce';
import {setV1LocalStorage} from '@docknetwork/wallet-sdk-data-store/src/migration/migration1/v1-data-store';
export type WalletSDKContextProps = {
  wallet: Wallet,
  status: string,
};

setV1LocalStorage(AsyncStorage);

export const WalletSDKContext = React.createContext({
  wallet: null,
});

setStorage(AsyncStorage);
export {useAccounts};
export {useDIDManagement, useDIDUtils};
export {
  useCredentialUtils,
  getCredentialStatus,
  useGetCredentialStatus,
  CREDENTIAL_STATUS,
};
export function getStorage() {
  return AsyncStorage;
}

export const filterDocsByType = (type: DocumentType) => doc =>
  doc.type === type;
export const filterByIds = idList => doc => idList.find(v => v === doc.id);
export const findDocument = (address, documents) =>
  documents.filter(doc => doc.id === address)[0];
export const findRelatedDocs = (document, documentList) =>
  document && document.correlation
    ? documentList.filter(doc => document.correlation.find(id => id === doc.id))
    : [];

export function getAccount(address, documents): AccountDetails {
  const addressDoc = findDocument(address, documents);

  if (!addressDoc) {
    return null;
  }

  const correlation = findRelatedDocs(addressDoc, documents);
  const currencyDoc = correlation.find(filterDocsByType('Currency'));
  const mnemonic = correlation.find(filterDocsByType('Mnemonic'));

  return {
    ...addressDoc,
    address,
    name: addressDoc.name,
    balance: currencyDoc && currencyDoc.value,
    mnemonic: mnemonic && mnemonic.value,
  };
}

export function useAccount(address) {
  const {documents, wallet} = useWallet();
  const account = getAccount(address, documents);

  return {
    account,
    fetchBalance: () => {
      wallet.accounts.fetchBalance(address);
    },
  };
}

export function useWallet() {
  return useContext(WalletSDKContext);
}

export function _useWalletController() {
  const [wallet, setWallet] = useState();
  const [status, setStatus] = useState('loading');
  const [documents, setDocuments] = useState([]);
  const [firstFetch, setFirstFetch] = useState();
  const [networkId, setNetworkId] = useState();

  const testMode = networkId === wallet?.dataStore?.testNetworkId;

  const toggleTestMode = async () => {
    await wallet.setNetwork(
      testMode
        ? wallet.dataStore.mainNetworkId
        : wallet.dataStore.testNetworkId,
    );
  };

  useEffect(() => {
    if (firstFetch) {
      return;
    }

    if (documents.length > 0 || !wallet) {
      return;
    }

    setFirstFetch(true);

    wallet.getAllDocuments().then(setDocuments);
  }, [documents, wallet, firstFetch]);

  const refetch = async ({fetchBalances} = {fetchBalances: true}) => {
      try {
        const allDocs = await wallet.query({});
        if (fetchBalances) {
          await Promise.all(
            allDocs
              .filter(doc => doc.type === 'Address')
              .map((doc: any) => {
                return wallet.accounts.fetchBalance(doc.address);
              }),
          );
        }

        setDocuments(allDocs);
      } catch (err) {
        console.error(err);
      }
    }

  useEffect(() => {
    if (!wallet) {
      return;
    }

    const _refetch = debounce(refetch, 800);

    setStatus(wallet.status);
    setNetworkId(wallet.getNetworkId());

    wallet.eventManager.on(WalletEvents.statusUpdated, setStatus);
    wallet.eventManager.on(WalletEvents.networkUpdated, () => {
      _refetch();
      setNetworkId(wallet.getNetworkId());
    });
    wallet.eventManager.on(WalletEvents.ready, _refetch);
    wallet.eventManager.on(WalletEvents.documentAdded, _refetch);
    wallet.eventManager.on(WalletEvents.documentRemoved, _refetch);
    wallet.eventManager.on(WalletEvents.documentUpdated, _refetch);
    wallet.eventManager.on(WalletEvents.walletImported, _refetch);
    wallet.eventManager.on(WalletEvents.migrated, _refetch);
    wallet.eventManager.on(WalletEvents.walletDeleted, () => {
      setDocuments([]);
    });
  }, [status, wallet, refetch]);

  const createWallet = async () => {
    const newWallet = await getOrCreateWallet();
    setWallet(newWallet);
  };

  return {
    wallet,
    createWallet,
    toggleTestMode,
    testMode,
    documents,
    status,
    refetch,
  };
}

export function WalletSDKProvider({onError, customUri, children, onReady}) {
  const controller = _useWalletController();
  const webViewRef = useRef();
  const sandboxWebViewRef = useRef();
  const baseUrl =
    Platform.OS === 'ios' ? 'app-html' : 'file:///android_asset/app-html';

  const {createWallet} = controller;

  const handleReady = useCallback(async () => {
    await createWallet();
    if (onReady) {
      onReady();
    }
  }, [onReady, createWallet]);

  const eventHandler: WebviewEventHandler = useMemo(
    () =>
      new WebviewEventHandler({
        webViewRef,
        sandboxWebViewRef,
        onReady: handleReady,
      }),
    [webViewRef, handleReady],
  );

  const webviewContainer = (
    <WebView
      style={{
        display: 'none',
      }}
      ref={webViewRef}
      originWhitelist={['*']}
      source={
        customUri
          ? {
              uri: customUri,
            }
          : {
              uri: `${baseUrl}/index.html`,
              baseUrl: baseUrl,
            }
      }
      onError={err => {
        console.error(err);
        if (onError) {
          onError(err);
        }
      }}
      onMessage={event => {
        eventHandler.handleEvent(event);
      }}
    />
  );

  const sandboxContainer = (
    <WebView
      style={{
        display: 'none',
      }}
      ref={sandboxWebViewRef}
      originWhitelist={['*']}
      source={{
        uri: `${baseUrl}/sandbox.html`,
        baseUrl: baseUrl,
      }}
      onError={err => {
        console.error(err);
        if (onError) {
          onError(err);
        }
      }}
      onMessage={event => {
        eventHandler.handleSandboxEvent(event);
      }}
    />
  );

  return (
    <View flex={1}>
      <WalletSDKContext.Provider value={controller}>
        {children}
      </WalletSDKContext.Provider>
      <View style={{height: 0}}>
        {webviewContainer}
        {sandboxContainer}
      </View>
    </View>
  );
}
