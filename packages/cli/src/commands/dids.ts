import {Command} from 'commander';
import inquirer from 'inquirer';
import axios from 'axios';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {createDIDProvider} from '@docknetwork/wallet-sdk-core/src/did-provider';
import {relayService} from '@docknetwork/wallet-sdk-wasm/lib/services/relay-service';
import {getWallet} from '../helpers';

const didsCommand = new Command('dids').description('list, create');

didsCommand
  .command('list')
  .option('-k, --keyPairs', 'List all did key pairs')
  .description('List wallet dids')
  .action(async options => {
    const wallet: IWallet = await getWallet();
    const didProvider = createDIDProvider({wallet});
    const dids = await didProvider.getAll();

    console.log('DID list:');
    console.log(dids.map(did => did.didDocument.id));

    if (options.keyPairs) {
      console.log('KeyPairs:');
      const keyPairs = await didProvider.getDIDKeyPairs();
      console.log(keyPairs);
    }
  });

didsCommand
  .command('create')
  .description('List wallet dids')
  .action(async () => {
    const wallet: IWallet = await getWallet();
    const didProvider = createDIDProvider({wallet});

    const did = await didProvider.createDIDKey({
      name: 'testDID',
    });

    console.log(did);
  });

/**
 * Resolve a DIDComm message
 * Ex.: didcomm://https://relay.truvera.io/read/659ed4b1655cf81a6a35e140'
 */
didsCommand
  .command('resolve-message')
  .option('-m, --message <message>', 'Message to be resolved')
  .description('Resolve didcomm message')
  .action(async ({ message }) => {
    const wallet: IWallet = await getWallet();
    const didProvider = createDIDProvider({wallet});
    const keyPairDocs = await didProvider.getDIDKeyPairs();

    const messsage = await relayService.resolveDidcommMessage({
      message,
      keyPairDocs,
    });

    console.log(messsage);
  });

export {didsCommand};
