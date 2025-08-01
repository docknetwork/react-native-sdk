import { issueCredential } from './helpers/certs-helpers';
import {
  getWallet,
  getDIDProvider,
  getMessageProvider,
  closeWallet,
} from './helpers/wallet-helpers';
import { logger } from '@docknetwork/wallet-sdk-data-store/src/logger';

describe('Credential Distribution', () => {
  let wallet;

  beforeAll(async () => {
    wallet = await getWallet();
  });

  it('should receive a credential issued to the wallet DID', async () => {
    const wallet = await getWallet();
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

  it('should receive multiple credentials issued to multiple wallet DIDs', async () => {
    const wallet = await getWallet();
    const didProvider = getDIDProvider();
    const messageProvider = getMessageProvider();
    await messageProvider.clearCache();

    await didProvider.createDIDKey({
      name: 'Another DID'
    });

    const dids = await didProvider.getAll();

    expect(dids.length).toBe(2);

    const credentialsCount = 1;
    await Promise.all(dids.map(async (did) => {
      console.log(did);
      for (let i = 0; i < credentialsCount; i++) {
        await issueCredential({
          subjectDID: did.didDocument.id,
        });
      }
    }));

    const stopAutoFetch = messageProvider.startAutoFetch();
    const message1 = await getMessageProvider().waitForMessage();

    console.log('Message 1 received', message1);
    const message2 = await getMessageProvider().waitForMessage();

    console.log('Message 2 received', message2);

    expect(message1.type).toBe(
      'https://didcomm.org/issue-credential/2.0/issue-credential',
    );
    expect(message2.type).toBe(
      'https://didcomm.org/issue-credential/2.0/issue-credential',
    );
    stopAutoFetch();
  });

  afterAll(() => closeWallet(wallet));
});
