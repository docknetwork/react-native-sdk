import { setStorage } from '@docknetwork/wallet-sdk-core/lib/core/storage';
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

export const WalletSDKContext = React.createContext({
  wallet: null,
});


setStorage(AsyncStorage);

export function useWallet({syncDocs = true} = {}) {
  const sdkContext = useContext(WalletSDKContext);
  const wallet: Wallet = sdkContext.wallet;
  const sdkStatus = sdkContext.sdkStatus;
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState('loading');

  console.log(wallet);

  useEffect(() => {
    if (sdkStatus !== 'ready') {
      return;
    }

    const updateDocuments = async () => {
      const allDocs = await wallet.query();
      setDocuments(allDocs);
    };

    wallet.eventManager.on(WalletEvents.statusUpdated, setStatus);

    if (syncDocs) {
      wallet.eventManager.on(WalletEvents.ready, updateDocuments);
      wallet.eventManager.on(WalletEvents.documentAdded, updateDocuments);
      wallet.eventManager.on(WalletEvents.documentRemoved, updateDocuments);
      wallet.eventManager.on(WalletEvents.documentUpdated, updateDocuments);
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
    const newWallet = Wallet.getInstance();
    newWallet.load();
    setWallet(newWallet);

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
      style={{display: 'none'}}
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
    <View>
      {webviewContainer}
      <WalletSDKContext.Provider value={{wallet, sdkStatus}}>
        {children}
      </WalletSDKContext.Provider>
    </View>
  );
}
