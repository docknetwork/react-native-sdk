import {Command} from 'commander';
import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {getWallet} from '../helpers';
import { walletService } from '@docknetwork/wallet-sdk-wasm/src/services/wallet';
import fs from 'fs';

const backupCommands = new Command('backup');

const createLocalStorageMock = () => {
  const store = {};

  const api = {
    clear: () => {
      for (const key in store) {
        delete store[key];
      }
    },
    getItem: (key) => {
      return key in store ? store[key] : null;
    },
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };

  return api;
};

global.localStorage = createLocalStorageMock();

backupCommands
  .command('decrypt')
  .option('-f, --file <filePath>', 'JSON file path')
  .option('-p, --password <password>', 'Password')
  .description('Decrypt wallet backup')
  .action(async ({file, password}) => {
    const wallet: IWallet = await getWallet();
    const json = fs.readFileSync(file, 'utf8');
    const encryptedData = JSON.parse(json);

    const documents = await walletService.getDocumentsFromEncryptedWallet({
        encryptedJSONWallet: encryptedData,
        password,
    });

    const decryptedFilePath = file.replace('.json', '-decrypted.json');
    fs.writeFileSync(decryptedFilePath, JSON.stringify(documents, null, 2));

    console.log(documents);
  });

export {backupCommands};
