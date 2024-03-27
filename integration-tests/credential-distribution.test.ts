import axios from 'axios';
import {
  getWallet,
  getDIDProvider,
  getMessageProvider,
} from './helpers/wallet-helpers';

function issueCredential({subjectDID}) {
  return axios.post(
    'https://***REMOVED***/credentials',
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
  it('should receive a credential using did distribution', async () => {
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
});
