import {Command} from 'commander';
import inquirer from 'inquirer';
import axios from 'axios';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {RelayService} from '@docknetwork/wallet-sdk-relay-service/src';
import testCredential from '../fixtures/customer-credential.json';
import {getDIDProvider, getWallet} from '../helpers';

const messagesCommand = new Command('messages').description(
  'fetch didcomm messages, send didcomm message',
);

messagesCommand
  .command('fetch')
  .description('Fetch DIDComm messages')
  .action(async () => {
    await getWallet();
    const didProvider = getDIDProvider();
    const keyPairDocs = await didProvider.getDIDKeyPairs();

    const messages = await RelayService.getMessages({
      keyPairDocs: keyPairDocs,
      limit: 10,
    });

    console.log(JSON.stringify(messages, null, 2));
  });

messagesCommand
  .command('send')
  .description('Send message using DIDComm')
  .action(async () => {
    await getWallet();
    const keyPairDocs = await getDIDProvider().getDIDKeyPairs();
    const recipientDid =
      'did:key:z6MkoQzWru66w91EH7U9Xsv5eYXQabw9U3ZJd5GkatMWkmZT';
    const message = 'Some message';

    console.log('Sending message to', {
      recipientDid,
      message,
    });

    const result = await RelayService.sendMessage({
      keyPairDoc: keyPairDocs[0],
      recipientDid,
      message,
    });

    console.log('Message sent!');
    console.log(result);
  });

const DIDAddressBook = {
  iosEmulator: 'did:key:z6MkuZRbStWnxNunsGRbWBfMdZaE9iqrgFkYZXi1C6dMtREi',
  walletCli: 'did:key:z6Mkw67FPTpdJ47zjXUeLBnifjBGNeexjUAxmFKaZ4oqed6B',
  iosDevice: 'did:key:z6MkoQzWru66w91EH7U9Xsv5eYXQabw9U3ZJd5GkatMWkmZT',
};

messagesCommand
  .command('send-credential')
  .description('Send message using DIDComm')
  .action(async () => {
    await getWallet();
    const keyPairDocs = await getDIDProvider().getDIDKeyPairs();
    const recipientDid = DIDAddressBook.iosEmulator;
    const message = {
      domain: 'api.dock.io',
      credentials: [testCredential],
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
