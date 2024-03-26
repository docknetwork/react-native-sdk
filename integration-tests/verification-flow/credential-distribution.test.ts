import axios from 'axios';
import {
  getWallet,
  getDIDProvider,
  getMessageProvider,
} from '../helpers/wallet-helpers';

function issueCredential({subjectDID}) {
  return axios.post(
    'https://api-staging.dock.io/credentials',
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
        'DOCK-API-TOKEN':
          'eyJzY29wZXMiOlsidGVzdCIsImFsbCJdLCJzdWIiOiI3Iiwic2VsZWN0ZWRUZWFtSWQiOiI4IiwiY3JlYXRvcklkIjoiNyIsImlhdCI6MTY5ODg1MzI0MiwiZXhwIjo0Nzc4MTQ5MjQyfQ.njdeY1QzgBP9alG2wWjr_8tpEGnMpa2baEPVhtjKYiZTHYe_FnBKVu7jksk-eoIOYqD41MtOP9mjn9cG9Ure2A',
        'Content-Type': 'application/json',
      },
    },
  );
}
describe('Credential Distribution', () => {
  it('should issue a credential and recieve it via relay service', async () => {
    const wallet = await getWallet();
    const currentDID = await getDIDProvider().getDefaultDID();
    console.log('Issue credential using certs');
    const result = await issueCredential({
      subjectDID: currentDID,
    });

    console.log('Credential issued with certs');

    console.log('Waiting for distribution message....');

    const message = await getMessageProvider().waitForMessage();

    console.log('Message received:');
    console.log(message);
  });
});
