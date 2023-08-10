import {Command} from 'commander';
import inquirer from 'inquirer';
import axios from 'axios';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {getWallet} from '../helpers';

const verificationCommands = new Command('verification');

verificationCommands
  .command('start')
  .option('-t, --template <template>', 'Verification template')
  .description('Start wallet verification flow')
  .action(async (options) => {
    const wallet: IWallet = await getWallet();

    console.log(options.template);
    // prompt for the verification template
    // The following process must be implement in the core package, using the verificationProvider
    // So that we can reuse it on the react native wallet as well

    // Logic:
    // Execute pex filters
    // show credentials matching
    // user select credential
    // if bbs, prompt for which attribute to share
    // handle range proof here

    console.log('verify credentials');
  });

verificationCommands
  .command('fetch')
  .description('Fetch verification request messages')
  .action(async () => {
    const wallet: IWallet = await getWallet();

    // check for relay service messages asking for a verification
  });

export {verificationCommands};
