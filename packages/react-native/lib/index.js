import {setStorage} from '@docknetwork/wallet-sdk-core/lib/core/storage';
import {
  Wallet,
  WalletEvents,
} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
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
import {AccountDetails} from '@docknetwork/wallet-sdk-core/lib/modules/account';
import {DocumentType} from '@docknetwork/wallet-sdk-core/lib/types';
import './rn-rpc-server';

export type WalletSDKContextProps = {
  wallet: Wallet,
  status: string,
};

export const WalletSDKContext = React.createContext({
  wallet: null,
});

setStorage(AsyncStorage);

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

function getAccount(address, documents): AccountDetails {
  const addressDoc = findDocument(address, documents);

  if (!addressDoc) {
    return null;
  }

  const correlation = findRelatedDocs(addressDoc, documents);
  const currencyDoc = correlation.find(filterDocsByType('Currency'));
  const mnemonic = correlation.find(filterDocsByType('Mnemonic'));

  return {
    address,
    name: addressDoc.name,
    balance: currencyDoc && currencyDoc.value,
    mnemonic: mnemonic && mnemonic.value,
  };
}

export function useAccount(address) {
  const {documents, wallet} = useWallet({syncDocs: true});
  const account = getAccount(address, documents);

  return {
    account,
    fetchBalance: () => {
      wallet.accounts.fetchBalance(address);
    },
  };
}

function getStorageDocuments() {
  return AsyncStorage.getItem('dock-wallet')
    .then(data => {
      if (!data) {
        return [];
      }

      data = JSON.parse(data);

      return Object.keys(data).map(key => data[key]);
    })
    .catch(() => []);
}

export function useWallet({syncDocs = true} = {}) {
  return useContext(WalletSDKContext);
}

export function WalletSDKProvider({onError, customUri, children, onReady}) {
  const [wallet, setWallet] = useState();
  const [status, setStatus] = useState('loading');
  const [documents, setDocuments] = useState([]);
  const webViewRef = useRef();
  const baseUrl =
    Platform.OS === 'ios' ? 'app-html' : 'file:///android_asset/app-html';

  useEffect(() => {
    if (documents.length > 0) {
      return;
    }

    getStorageDocuments().then(docs => {
      setDocuments(currentDocs => (currentDocs.length ? currentDocs : docs));
    });
  }, [documents]);

  const refetch = useCallback(
    async ({fetchBalances} = {}) => {
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
    },
    [wallet, setDocuments],
  );

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    if (!wallet) {
      return;
    }

    setStatus(wallet.status);

    wallet.eventManager.on(WalletEvents.statusUpdated, setStatus);
    wallet.eventManager.on(WalletEvents.ready, refetch);
    wallet.eventManager.on(WalletEvents.documentAdded, refetch);
    wallet.eventManager.on(WalletEvents.documentRemoved, refetch);
    wallet.eventManager.on(WalletEvents.documentUpdated, refetch);

    if (wallet && wallet.status === 'ready') {
      refetch();
    }
  }, [status, wallet, refetch]);

  const handleReady = useCallback(async () => {
    const newWallet = Wallet.getInstance();
    setWallet(newWallet);
    newWallet.load();

    newWallet.eventManager.on(WalletEvents.ready, () => {
      setStatus('ready');
      if (onReady) {
        onReady();
      }
    });
  }, [setWallet, onReady]);

  const eventHandler: WebviewEventHandler = useMemo(
    () =>
      new WebviewEventHandler({
        webViewRef,
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
        setStatus('error');
        if (onError) {
          onError(err);
        }
      }}
      onMessage={event => {
        eventHandler.handleEvent(event);
      }}
    />
  );

  return (
    <View flex={1}>
      <WalletSDKContext.Provider
        value={{
          wallet,
          documents,
          status,
          refetch: () => refetch({fetchBalances: true}),
        }}>
        {children}
      </WalletSDKContext.Provider>
      <View style={{height: 0}}>{webviewContainer}</View>
    </View>
  );
}
