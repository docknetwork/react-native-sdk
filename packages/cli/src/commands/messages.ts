import {Command} from 'commander';
import inquirer from 'inquirer';
import axios from 'axios';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {getWallet} from '../helpers';

const messagesCommand = new Command('messages').description(
  'fetch didcomm messages, send didcomm message',
);

messagesCommand
  .command('fetch')
  .description('Fetch DIDComm messages')
  .action(async () => {
    const wallet: IWallet = await getWallet();

    // fetch did list from wallet
    // fetch messages using relay service
  });

messagesCommand
  .command('send')
  .description('Send message using DIDComm')
  .action(async () => {
    const wallet: IWallet = await getWallet();

    const {recipientDID, message} = await inquirer.prompt([
      {
        type: 'list',
        name: 'did',
        message: 'Select a DID to sign the message with',
        choices: ['did:example:123', 'did:example:456'],
      },
      {
        type: 'input',
        name: 'recipientDID',
        message: 'Enter the recipient DID',
      },
      {
        type: 'editor',
        name: 'message',
        message: 'Enter the message (leave it empty to copy from clipboard)',
      },
    ]);

    console.log(`Sending message to`, {
      recipientDID,
      message,
    });

    // send relay service message
    // if multiple dids, ask with did to use
  });

export {messagesCommand};
