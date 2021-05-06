/*
  FSWallet example
*/
// import FSWallet from '@docknetwork/wallet/fs-wallet';
import MemoryWallet from './memory-storage-wallet';
import runWalletExample from './run-wallet-example';

// Path to wallet on disk
const walletId = 'mywallet';

/**
  This example creates a filesystem stored wallet. It's not encrypted, it's mostly
  as an example of creating a custom storage interface.
* */
async function main() {
  console.log('Loading filesystem wallet:', walletId);
  const memoryWallet = new MemoryWallet(walletId);
  await runWalletExample(memoryWallet);
}

main()
  .catch((e) => {
    console.error(e);
    // process.exit(1);
  });
