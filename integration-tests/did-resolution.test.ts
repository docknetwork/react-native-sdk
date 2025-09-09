import {blockchainService} from '@docknetwork/wallet-sdk-wasm/src/services/blockchain';
import {issueCredential} from './helpers/certs-helpers';
import {
  getWallet,
  getDIDProvider,
  getMessageProvider,
  closeWallet,
} from './helpers/wallet-helpers';
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import { storageService } from '@docknetwork/wallet-sdk-wasm/src/services/storage';

describe('DID resolution', () => {
  let wallet;

  beforeAll(async () => {
    wallet = await getWallet();
  });

  it('should resolve did service endpoints', async () => {
    const wallet = await getWallet();
    const currentDID = await getDIDProvider().getDefaultDID();

    const doc1 = await blockchainService.resolveDID(
      'did:cheqd:testnet:c0890f1c-c7bb-4ea6-be7a-8c31404743b7',
    );

    const messagingService = doc1.service.find(service => service.type === 'DIDCommMessaging');
    expect(messagingService).toBeDefined();

    const cacheKey = `did-cache:did:cheqd:testnet:c0890f1c-c7bb-4ea6-be7a-8c31404743b7`;
    const cacheJSON = await storageService.getItem(cacheKey);
    expect(cacheJSON).toBeDefined();

    const cachedEntry = JSON.parse(cacheJSON);
    expect(cachedEntry.value).toEqual(doc1);
    expect(cachedEntry.id).toEqual('did:cheqd:testnet:c0890f1c-c7bb-4ea6-be7a-8c31404743b7');
  });

  afterAll(() => closeWallet(wallet));
});
