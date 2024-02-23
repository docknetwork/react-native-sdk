import {Command} from 'commander';
import {typedHexDID, createNewDockDID, registerNewDIDUsingPair} from '@docknetwork/sdk/utils/did/typed-did/helpers';
import {dockService} from '@docknetwork/wallet-sdk-wasm/src/services/dock/service';
import {getDIDProvider, getWallet} from '../helpers';
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

    await dockService.init({
      address: 'wss://knox-1.dock.io',
    });

    await dockService.waitDockReady();
    await dockService.ensureDockReady();

    const trustRegistryId = randomAsHex(32);

    const trustRegistry = await dockService.dock.trustRegistry.initOrUpdate(
      didKeyPair.id,
      trustRegistryId,
      'Test Registry II',
      'Gov framework II',
      didKeyPair,
      dockService.dock,
    );
    console.log(trustRegistry);

    await dockService.disconnect();
  });

ecosystemCommands
  .command('getEcosystemFromDID')
  .option('-d, --did <did>', 'DID')
  .description('Get ecosystem from DID')
  .action(async ({did}) => {
    await dockService.init({
      address: 'wss://knox-1.dock.io',
    });

    await dockService.waitDockReady();
    await dockService.ensureDockReady();

    const verifierDIDMethodKey = typedHexDID(
      dockService.dock.api,
      did,
    );
    const registryInfo = await dockService.dock.trustRegistry?.registriesInfo({
      Issuer: verifierDIDMethodKey,
    });
    console.log(registryInfo);

    await dockService.disconnect();
  });

export {ecosystemCommands};
