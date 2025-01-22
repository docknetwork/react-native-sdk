import {Command} from 'commander';
import {blockchainService} from '@docknetwork/wallet-sdk-wasm/src/services/blockchain/service';
import {getWallet} from '../helpers';
import {getDIDKeyPairs} from '@docknetwork/wallet-sdk-core/src/did-provider';
import {randomAsHex} from '@polkadot/util-crypto';

const ecosystemCommands = new Command('ecosystem');

ecosystemCommands.description('getEcosystemTools');

ecosystemCommands
  .command('createEcosystem')
  .description('Create a trust registry')
  .action(async () => {
    const wallet = await getWallet();

    const didKeyPairs = await getDIDKeyPairs({wallet});
    const didKeyPair = didKeyPairs[0];

    await blockchainService.init({
      address: 'wss://knox-1.dock.io',
    });

    await blockchainService.waitBlockchainReady();
    await blockchainService.ensureBlockchainReady();

    const trustRegistryId = randomAsHex(32);

    const trustRegistry = await blockchainService.dock.trustRegistry.initOrUpdate(
      didKeyPair.id,
      trustRegistryId,
      'Test Registry II',
      'Gov framework II',
      didKeyPair,
      blockchainService.dock,
    );
    console.log(trustRegistry);

    await blockchainService.disconnect();
  });

export {ecosystemCommands};
