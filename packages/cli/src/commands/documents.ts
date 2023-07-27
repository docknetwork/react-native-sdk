import {Command} from 'commander';
import inquirer from 'inquirer';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {getWallet} from '../helpers';
import clipboardy from 'clipboardy';

const documentsCommand = new Command('documents');

documentsCommand.description('List, add');

documentsCommand
  .command('list')
  .description('List wallet credentials')
  .action(async () => {
    const wallet: IWallet = await getWallet();

    const data = await wallet.getAllDocuments();

    console.log(data);
  });

documentsCommand
  .command('add')
  .description('Import credential from URL')
  .action(async () => {
    const wallet: IWallet = await getWallet();
    let jsonData;

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'jsonData',
        message:
          'Enter the document JSON data (leave it empty to copy from clipboard)',
      },
    ]);

    if (answers.jsonData) {
      jsonData = answers.jsonData;
    } else {
      jsonData = await clipboardy.read();
    }

    await wallet.addDocument(JSON.parse(jsonData));

    console.log('Document added to the wallet');
  });

export {documentsCommand};
