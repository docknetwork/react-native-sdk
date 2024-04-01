import {Command} from 'commander';
import inquirer from 'inquirer';
import input from '@inquirer/input';
import axios from 'axios';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {RelayService} from '@docknetwork/wallet-sdk-relay-service/src';
import testCredential from '../fixtures/customer-credential.json';
import {getDIDProvider, getMessageProvider, getWallet, selectCredential} from '../helpers';

const messagesCommand = new Command('messages').description(
  'fetch didcomm messages, send didcomm message',
);

messagesCommand
  .command('fetch')
  .description('Fetch DIDComm messages')
  .action(async () => {
    const wallet = await getWallet();
    const messageProvider = getMessageProvider();
    await messageProvider.fetchMessages();

    wallet.eventManager.on('didcomm-message-decrypted', ({decryptedMessage, messageId}) => {
      console.log('message received', decryptedMessage);
      messageProvider.markMessageAsRead(messageId);
    });

    await messageProvider.processDIDCommMessages();
  });

messagesCommand
  .command('send')
  .description('Send message using DIDComm')
  .action(async () => {
    await getWallet();
    const keyPairDocs = await getDIDProvider().getDIDKeyPairs();
    const recipientDid = await input({
      message: 'Enter the recipient DID',
    });
    const message = await input({
      message: 'Enter the message',
    });

    console.log('Sending message to', {
      recipientDid,
      message,
    });

    const result = await RelayService.sendMessage({
      keyPairDoc: keyPairDocs[0],
      recipientDid,
      message,
    } as any);

    console.log('Message sent!');
    console.log(result);
  });

messagesCommand
  .command('send-credential')
  .description('Send message using DIDComm')
  .action(async () => {
    await getWallet();
    const keyPairDocs = await getDIDProvider().getDIDKeyPairs();
    const recipientDid = await input({
      message: 'Enter the recipient DID',
    });
    const credential = await selectCredential();
    const message = {
      domain: 'api.dock.io',
      credentials: [credential],
    };

    console.log('Sending VC to', recipientDid);

    const result = await RelayService.sendMessage({
      keyPairDoc: keyPairDocs[0],
      recipientDid,
      message,
    } as any);

    console.log('Message sent!');
    console.log(result);
  });

export {messagesCommand};
