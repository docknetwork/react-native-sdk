import {Command} from 'commander';
import inquirer from 'inquirer';
import axios from 'axios';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {getWallet} from '../helpers';

const credentialsCommand = new Command('credentials').description(
  'list, filter with pex filter, import from url',
);

credentialsCommand
  .command('list')
  .option('-t, --type <type>', 'Credential type')
  .option('-v, --validate', 'Get credential validation status')
  .description('List wallet credentials')
  .action(async () => {
    const wallet: IWallet = await getWallet();

    const data = await wallet.getDocumentsByType('VerifiableCredential');

    console.log(data);
  });

credentialsCommand
  .command('filter')
  .description('Filter credential list using a verification template')
  .action(async () => {
    const wallet: IWallet = await getWallet();

    const data = await wallet.getDocumentsByType('VerifiableCredential');

    const {template} = await inquirer.prompt([
      {
        type: 'input',
        name: 'template',
        message:
          'Enter the verification template (leave it empty to copy from clipboard)',
      },
    ]);
    // prompt for the verification template
    // perform pex filters
    // show credentials matching

    console.log(data);
  });

credentialsCommand
  .command('import')
  .description('Import credential from URL')
  .action(async () => {
    const wallet: IWallet = await getWallet();

    const {url} = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter the credential URL',
      },
    ]);

    // We could integrate this with the wallet event emitters, so that it can share the same logic with react-native wallet
    const {password} = await inquirer.prompt([
      {
        type: 'input',
        name: 'password',
        message: 'Enter the credential password',
      },
    ]);

    const {data} = await axios.get(`${url}?p=${btoa(password)}`);

    await wallet.addDocument(data);

    console.log('Document added to the wallet');
  });

export {credentialsCommand};
