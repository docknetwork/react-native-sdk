import {Command} from 'commander';
import inquirer from 'inquirer';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {getWallet} from '../helpers';
import clipboardy from 'clipboardy';
import {WalletEvents} from '@docknetwork/wallet-sdk-core/src/wallet';
import {substrateService} from '@docknetwork/wallet-sdk-wasm/src/services/substrate';

const accountsCommands = new Command('accounts');

accountsCommands.description('getBalance');

accountsCommands
  .command('balance')
  .option('-a, --address <address>', 'Account address')
  .description('Get account balance')
  .action(async ({address}) => {
    const wallet: IWallet = await getWallet();

    await wallet.waitForEvent(WalletEvents.networkConnected);

    console.log(`Fetching balance for account ${address}`);
    const balance = await substrateService.getAccountBalance({address});

    console.log(balance);
  });

export {accountsCommands};
