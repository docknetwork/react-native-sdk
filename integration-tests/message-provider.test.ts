import {issueCredential} from './helpers/certs-helpers';
import {
  getWallet,
  getDIDProvider,
  getMessageProvider,
  closeWallet,
} from './helpers/wallet-helpers';
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';

describe('Credential Distribution', () => {
  let wallet;

  beforeAll(async () => {
    wallet = await getWallet();
  });

  it('should send yes/no message to service endpoint', async () => {
    const wallet = await getWallet();
    const currentDID = await getDIDProvider().getDefaultDID();

    const result = await getMessageProvider().sendMessage({
      from: currentDID,
      to: 'did:cheqd:testnet:c0890f1c-c7bb-4ea6-be7a-8c31404743b7',
      body: {
        messageID: '123',
        response: 'yes',
      },
      useDIDServiceEndpoint: true,
      type: 'https://schema.truvera.io/yes-no-response-V1.json',
    });

    expect(result.status).toBe('received');
  });

  afterAll(() => closeWallet(wallet));
});
