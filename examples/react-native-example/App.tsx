import React, {useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {WalletSDKProvider} from '@docknetwork/wallet-sdk-react-native/lib';
import {DEFAULT_WALLET_CONFIGS} from '@docknetwork/wallet-sdk-react-native/lib/wallet';
import CredentialsScreen from './components/CredentialsScreen';

const walletConfigs = {
  ...DEFAULT_WALLET_CONFIGS,
  defaultNetwork: 'testnet',
};

function App(): React.JSX.Element {
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [walletError, setWalletError] = useState<Error | null>(null);

  return (
    <WalletSDKProvider
      configs={walletConfigs}
      onReady={() => {
        console.log('Wallet SDK is ready');
        setIsWalletReady(true);
      }}
      onError={(error: Error) => {
        console.error('Wallet SDK error:', error);
        setWalletError(error);
      }}
      customUri={null}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Wallet SDK Examples
          </Text>
        </View>

        {walletError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {walletError.message}</Text>
          </View>
        )}

        {!isWalletReady ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Initializing Wallet SDK...</Text>
          </View>
        ) : (
          <CredentialsScreen />
        )}
      </SafeAreaView>
    </WalletSDKProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
  },
});

export default App;
