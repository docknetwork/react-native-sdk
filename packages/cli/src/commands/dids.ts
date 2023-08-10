import {Command} from 'commander';
import inquirer from 'inquirer';
import axios from 'axios';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {createDIDProvider} from '@docknetwork/wallet-sdk-core/src/did-provider';
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

export {didsCommand};
