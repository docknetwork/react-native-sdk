import {View, Button, Text} from 'react-native';
import React from 'react';
import {
  WalletSDKProvider,
  useWallet,
} from '@docknetwork/wallet-sdk-react-native/lib';

const WalletDetails = function () {
  const {wallet, status, documents} = useWallet();

  return (
    <View>
      <Text>Wallet status: {status}</Text>
      <Text>Wallet docs: {documents.length}</Text>
      <Button
        onPress={() => wallet.accounts.create({name: 'test'})}
        title="Add Account"
      />
    </View>
  );
};

const App = () => {
  return (
    <WalletSDKProvider>
      <View p={8}>
        <Text>Dock Wallet SDK Demo</Text>
        <Text>Press on `add document` button to create a new account</Text>
      </View>
      {/* <WalletDetails /> */}
    </WalletSDKProvider>
  );
};

export default App;
