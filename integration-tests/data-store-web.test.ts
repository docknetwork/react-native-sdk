import {
  getDIDProvider,
  getMessageProvider,
  closeWallet,
  createNewWallet,
} from './helpers/wallet-helpers';
import { issueCredential } from './helpers/certs-helpers';
import { logger } from '@docknetwork/wallet-sdk-data-store/src/logger';
import { createDataStore } from '@docknetwork/wallet-sdk-data-store-web/src';
import { localStorageJSON } from '@docknetwork/wallet-sdk-data-store-web/src/localStorageJSON';

describe('Data store web', () => {
  let wallet;
  let dataStore;

  beforeAll(async () => {
    dataStore = await createDataStore({
      databasePath: ':memory:',
      defaultNetwork: 'testnet',
    });

    wallet = await createNewWallet({
      dataStore,
    });
  });

  it('create, update and remove documents', async () => {
    const currentDID = await getDIDProvider().getDefaultDID();

    await wallet.addDocument({
      type: 'VerifiableCredential',
      id: '123',
      credentialSubject: {
        id: currentDID,
        name: 'Test',
      }
    })

    await wallet.addDocument({
      type: 'VerifiableCredential',
      id: '124',
      credentialSubject: {
        id: currentDID,
        name: 'Test',
      }
    })

    await wallet.removeDocument('124');

    await wallet.updateDocument({
      type: 'VerifiableCredential',
      id: '123',
      credentialSubject: {
        id: 'another-id',
        name: 'Test',
      }
    })

    const documents = await localStorageJSON.getItem('documents');

    for (const doc of documents) {
      expect(doc.data).toBeDefined();
    }

    expect(documents.find(d => d.id === '124')).toBeUndefined();
    expect(documents.find(d => d.id === '123').data.credentialSubject.id).toBe('another-id');
  });

  it('should receive a credential issued to the wallet DID', async () => {
    const currentDID = await getDIDProvider().getDefaultDID();

    let time = Date.now();
    console.log('Issue credential using certs');
    const result = await issueCredential({
      subjectDID: currentDID,
    });

    logger.performance('Credential issued', time);

    time = Date.now();
    console.log('Waiting for distribution message....');

    getMessageProvider().startAutoFetch();

    const message = await getMessageProvider().waitForMessage();

    logger.performance('Credential received', time);

    expect(message.type).toBe(
      'https://didcomm.org/issue-credential/2.0/issue-credential',
    );
  });

  afterAll(() => closeWallet(wallet));
});
