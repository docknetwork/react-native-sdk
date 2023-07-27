import {Command} from 'commander';
import inquirer from 'inquirer';
import axios from 'axios';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {getWallet} from '../helpers';

const didsCommand = new Command('dids').description('list, create');

didsCommand
  .command('list')
  .description('List wallet dids')
  .action(async () => {
    const wallet: IWallet = await getWallet();

    const dids = await wallet.getDocumentsByType('DIDResolution');

    console.log(dids);
  });

didsCommand
  .command('create')
  .description('List wallet dids')
  .action(async () => {
    const wallet: IWallet = await getWallet();

    // implement did creation logic, start with did key
  });

export {didsCommand};
