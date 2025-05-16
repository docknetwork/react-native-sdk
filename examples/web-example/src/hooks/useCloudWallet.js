import { useState, useEffect } from 'react';
import { createDataStore } from '@docknetwork/wallet-sdk-data-store-web/lib/index';
import { initializeCloudWallet } from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';
import { createWallet } from '@docknetwork/wallet-sdk-core/lib/wallet';
import { createCredentialProvider } from '@docknetwork/wallet-sdk-core/lib/credential-provider';
import { createDIDProvider } from '@docknetwork/wallet-sdk-core/lib/did-provider';
import { createMessageProvider } from '@docknetwork/wallet-sdk-core/lib/message-provider';

const EDV_URL = 'https://edv.dock.io';
const EDV_AUTH_KEY = 'DOCKWALLET-TEST';

function useCloudWallet(walletKeys) {
  const [loading, setLoading] = useState(false);
  const [cloudWallet, setCloudWallet] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [credentialProvider, setCredentialProvider] = useState(null);
  const [didProvider, setDidProvider] = useState(null);
  const [defaultDID, setDefaultDID] = useState(null);
  const [messageProvider, setMessageProvider] = useState(null);
  const [dataStore, setDataStore] = useState(null);

  async function provisionNewWallet(_dataStore) {
    if (!walletKeys) {
      return;
    }

    setLoading(true);

    try {
      const _wallet = await createWallet({ dataStore: _dataStore || dataStore });
      setWallet(_wallet);

      const _credentialProvider = await createCredentialProvider({ wallet: _wallet });
      setCredentialProvider(_credentialProvider);

      const _didProvider = createDIDProvider({ wallet: _wallet });
      setDidProvider(_didProvider);
      setDefaultDID(await _didProvider.getDefaultDID());

      const _messageProvider = createMessageProvider({
        wallet: _wallet,
        didProvider: _didProvider,
      });
      setMessageProvider(_messageProvider);
    } catch (err) {
      console.error('Error provisioning new wallet', err);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function init() {
      if (!walletKeys) {
        return;
      }

      setLoading(true);
      try {
        const _dataStore = await createDataStore({
          databasePath: 'dock-wallet',
          defaultNetwork: 'testnet',
        });
        setDataStore(_dataStore);

        const _cloudWallet = await initializeCloudWallet({
          dataStore: _dataStore,
          edvUrl: EDV_URL,
          agreementKey: walletKeys.agreementKey,
          verificationKey: walletKeys.verificationKey,
          hmacKey: walletKeys.hmacKey,
          authKey: EDV_AUTH_KEY,
        });
        setCloudWallet(_cloudWallet);

        try {
          await _cloudWallet.pullDocuments();
        } catch (err) {
          console.error('Error pulling documents from EDV', err);
        }

        const documents = await _dataStore.documents.getAllDocuments();
        console.log('Documents:', documents);

        if (documents.length !== 0) {
          await provisionNewWallet(_dataStore);
        }

      } catch (err) {
        console.error('Error initializing cloud wallet', err);
      }
      setLoading(false);
    }
    init();

    return () => {
      if (cloudWallet && typeof cloudWallet.unsubscribeEventListeners === 'function') {
        cloudWallet.unsubscribeEventListeners();
      }
    };
  }, [walletKeys]);

  return {
    loading,
    cloudWallet,
    wallet,
    credentialProvider,
    didProvider,
    defaultDID,
    messageProvider,
    dataStore,
    provisionNewWallet,
  };
}

export default useCloudWallet;
