import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import WebView from 'react-native-webview';
import rpcServer from './rn-rpc-server';
import {Platform, View} from 'react-native';
import {Logger} from '../core/logger';
import {Wallet, WalletEvents} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import { createMessageHandler, WebviewEventHandler } from './message-handler';

const WEBVIEW_URI = 'http://localhost:3000';
const DEV_MODE = false;


const b = 3;

export const WalletSDKContext = React.createContext({
  wallet: null,
});

export function useWallet({ syncDocs = true } = {}) {
  const sdkContext = useContext(WalletSDKContext);
  const wallet: Wallet = sdkContext.wallet;
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState('loading');
  
  console.log(wallet);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    const updateDocuments = async () => {
      const allDocs = await wallet.query();
      setDocuments(allDocs);
    }

    wallet.eventManager.on(WalletEvents.statusUpdated, setStatus);
    
    if (syncDocs) {
      wallet.eventManager.on(WalletEvents.documentAdded, updateDocuments);
      wallet.eventManager.on(WalletEvents.documentRemoved, updateDocuments);
      wallet.eventManager.on(WalletEvents.documentUpdated, updateDocuments);
    }
  }, [wallet]);
  
  
  return {
    wallet,
    status,
    documents
  }
}

export function WalletSDKProvider({
  onError,
  customUri,
  children,
  onReady
}) {
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

  const eventHandler: WebviewEventHandler = useMemo(() => new WebviewEventHandler({
    webViewRef,
    onReady: handleReady
  }), [webViewRef, handleReady]);

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
      onError={(err) => {
        setSdkStatus('error');
        if (onError) {
          onError();
        }
      }}
      onMessage={(event) => {
        eventHandler.handleEvent(event)
      }}
    />
  )

  return (
    <View>
      { webviewContainer}
      <WalletSDKContext.Provider value={{ wallet }}>
        {children}
      </WalletSDKContext.Provider>
    </View>
  );
}
