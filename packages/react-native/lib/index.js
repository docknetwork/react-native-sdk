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
import {AccountDetails} from "@docknetwork/wallet-sdk-core/lib/modules/account";
import {DocumentType} from "@docknetwork/wallet-sdk-core/lib/types";

export type WalletSDKContextProps = {
  wallet: Wallet,
  sdkStatus: string,
};

export const WalletSDKContext = React.createContext({
  wallet: null,
});

setStorage(AsyncStorage);

export function getStorage() {
  return AsyncStorage;
}

export const filterDocsByType = (type: DocumentType) => doc => doc.type === type;
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
  const {documents} = useWallet({syncDocs: true});
  const account = getAccount(address, documents);

  console.log('account', account);
  return {
    account,
  };
}

export function useWallet({syncDocs = true} = {}) {
  const sdkContext = useContext(WalletSDKContext);
  const wallet: Wallet = sdkContext.wallet;
  const sdkStatus = sdkContext.sdkStatus;
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState('loading');

  console.log(wallet);

  useEffect(() => {
    console.log({sdkStatus, wallet, syncDocs});

    if (sdkStatus !== 'ready') {
      return;
    }

    if (!wallet) {
      return;
    }

    const updateDocuments = async () => {
      try {
        const allDocs = await wallet.query({});
        setDocuments(allDocs);
      } catch (err) {
        console.error(err);
      }
    };

    setStatus(wallet.status);

    wallet.eventManager.on(WalletEvents.statusUpdated, setStatus);

    if (syncDocs) {
      wallet.eventManager.on(WalletEvents.ready, updateDocuments);
      wallet.eventManager.on(WalletEvents.documentAdded, updateDocuments);
      wallet.eventManager.on(WalletEvents.documentRemoved, updateDocuments);
      wallet.eventManager.on(WalletEvents.documentUpdated, updateDocuments);

      if (wallet && wallet.status === 'ready') {
        updateDocuments();
      }
    }
  }, [sdkStatus, wallet, syncDocs]);

  return {
    wallet,
    status,
    documents,
  };
}

export function WalletSDKProvider({onError, customUri, children, onReady}) {
  const [wallet, setWallet] = useState();
  const [sdkStatus, setSdkStatus] = useState('loading');

  const webViewRef = useRef();
  const baseUrl =
    Platform.OS === 'ios' ? 'app-html' : 'file:///android_asset/app-html';

  const handleReady = useCallback(() => {
    const newWallet = Wallet.getInstance({});
    setWallet(newWallet);
    newWallet.load();

    setSdkStatus('ready');

    if (onReady) {
      onReady();
    }
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
        setSdkStatus('error');
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
      <WalletSDKContext.Provider value={{wallet, sdkStatus}}>
        {children}
      </WalletSDKContext.Provider>
      <View style={{height: 0}}>{webviewContainer}</View>
    </View>
  );
}
