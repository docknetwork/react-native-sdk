import {Command} from 'commander';
import inquirer from 'inquirer';
import axios from 'axios';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {getWallet, getCredentialProvider} from '../helpers';
import clipboardy from 'clipboardy';
import {pexService} from '@docknetwork/wallet-sdk-wasm/src/services/pex';
import input from '@inquirer/input';
import { WalletEvents } from '@docknetwork/wallet-sdk-core/src/wallet';

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
  .action(async (options) => {
    const wallet: IWallet = await getWallet();

    const credentials = await wallet.getDocumentsByType('VerifiableCredential');

    let template = options.template;

    if (!template) {
      template = await input({
        message:
          'Enter the proof request template URL (leave it empty to copy a JSON from clipboard)',
      });

      if (!template) {
        template = await clipboardy.read();
      }
    }

    const result = await pexService.filterCredentials({
      credentials,
      presentationDefinition: JSON.parse(template).request,
      holderDIDs: [],
    });

    console.log(JSON.stringify(result, null, 2));
  });

credentialsCommand
  .command('clear')
  .option('-t, --type <type>', 'Credential type')
  .option('-v, --validate', 'Get credential validation status')
  .description('List wallet credentials')
  .action(async () => {
    const wallet: IWallet = await getWallet();

    const data = await wallet.getDocumentsByType('VerifiableCredential');

    // remove all credentials
    for (const credential of data) {
      await wallet.removeDocument(credential.id)
    }

  });

credentialsCommand
  .command('validate')
  .description('Check if credential is valid')
  .action(async () => {
    const wallet: IWallet = await getWallet();
    await wallet.waitForEvent(WalletEvents.networkConnected);

    let credential;
   
    let {url} = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter the credential URL (leave it empty to copy a JSON from clipboard)',
      },
    ]);

    if (url) {
      const {password} = await inquirer.prompt([
        {
          type: 'input',
          name: 'password',
          message: 'Enter the credential password',
        },
      ]);

      const {data} = await axios.get(`${url}?p=${btoa(password)}`);
      credential = data;
    } else {
        credential = JSON.parse(await clipboardy.read());
    }

    delete credential['$$accum__witness$$'];

    const result = await getCredentialProvider().isValid(credential);

    console.log('Validation result');
    console.log(JSON.stringify(result));
  });

credentialsCommand
  .command('download')
  .description('Download credential JSON from URL')
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

    const {data: credential} = await axios.get(`${url}?p=${btoa(password)}`);

    clipboardy.write(JSON.stringify(credential))
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
