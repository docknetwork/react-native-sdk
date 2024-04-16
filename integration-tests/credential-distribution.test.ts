import axios from 'axios';
import {
  getWallet,
  getDIDProvider,
  getMessageProvider,
  closeWallet,
} from './helpers/wallet-helpers';
import assert from 'assert';

const testAPIURL = process.env.TESTING_API_URL || null;

function issueCredential({subjectDID}) {
  console.log('Issuing credential for DID', subjectDID);

  return axios.post(
    `${testAPIURL}/credentials`,
    {
      anchor: false,
      password: 'test',
      persist: true,
      emailMessage: '',
      credential: {
        name: 'Test2',
        type: ['VerifiableCredential', 'BasicCredential'],
        issuer: 'did:dock:5GJeBeStWSxqyPGUJnERMFhm3wKcfCZP6nhqtoKyRAmq9FeU',
        issuanceDate: '2023-11-01T15:43:59.361Z',
        subject: {
          id: subjectDID,
          name: 'Test',
        },
      },
      recipientEmail: 'maycon@dock.io',
      algorithm: 'dockbbs+',
      distribute: true,
    },
    {
      headers: {
        'DOCK-API-TOKEN': process.env.CERTS_API_KEY,
        'Content-Type': 'application/json',
      },
    },
  );
}
describe('Credential Distribution', () => {
  let wallet;

  beforeAll(async () => {
    wallet = await getWallet();
  });

  it('should receive a credential issued to the wallet DID', async () => {
    assert(testAPIURL, "Please configure the TESTING_API_URL env var.");
    const wallet = await getWallet();
    const currentDID = await getDIDProvider().getDefaultDID();

    let time = new Date().getTime();
    console.log('Issue credential using certs');
    const result = await issueCredential({
      subjectDID: currentDID,
    });

    console.log(`Credential issued in ${new Date().getTime() - time} ms`);

    time = new Date().getTime();
    console.log('Waiting for distribution message....');

    getMessageProvider().startAutoFetch();

    const message = await getMessageProvider().waitForMessage();

    console.log(`Credential received in ${new Date().getTime() - time} ms`);
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
