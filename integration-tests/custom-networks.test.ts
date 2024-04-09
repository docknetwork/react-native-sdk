import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/src/wallet';
import {Network} from '@docknetwork/wallet-sdk-data-store/src/types';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/src/modules/wallet';
import {closeWallet} from './helpers/wallet-helpers';

describe('Custom networks', () => {
  let wallet: IWallet;
  const networks: Network[] = [
    {
      name: 'polygon',
      credentialHostnames: ['creds.polygon.com'],
      id: 'polygon',
      configs: {
        substrateUrl: 'wss://knox-1.dock.io',
        addressPrefix: 21,
      },
    },
    {
      name: 'Polygon mumbai',
      credentialHostnames: ['creds.mumbai.polygon.com'],
      id: 'mumbai',
      configs: {
        substrateUrl: 'wss://knox-1.dock.io',
        addressPrefix: 21,
      },
    },
  ];

  const mockDocuments = {
    mainnet: {
      id: 'mainnet-doc',
      value: 'mainnet doc',
      type: 'JWT-VC',
    },
    testnet: {
      id: 'testnet-doc',
      value: 'testnet doc',
      type: 'JWT-VC',
    },
  };

  beforeAll(async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
      networks,
    });

    await wallet.waitForEvent(WalletEvents.networkConnected);

    console.log('adding documents to the wallet');
    await wallet.addDocument(mockDocuments.mainnet);
  });

  it('should have documents only on mainnet', async () => {
    const doc = await wallet.getDocumentById(mockDocuments.mainnet.id);

    expect(doc.value).toEqual(mockDocuments.mainnet.value);

    wallet.setNetwork('mumbai');

    let mumbaiDocc = await wallet.getDocumentById(mockDocuments.testnet.id);

    expect(mumbaiDocc).toBeNull();
  });

  it('should add document to mumbai without affecting polygon', async () => {
    wallet.setNetwork('mumbai');

    await wallet.addDocument(mockDocuments.testnet);
    let doc = await wallet.getDocumentById(mockDocuments.testnet.id);
    expect(doc.value).toEqual(mockDocuments.testnet.value);

    wallet.setNetwork('polygon');
    doc = await wallet.getDocumentById(mockDocuments.mainnet.id);
    expect(doc.value).toEqual(mockDocuments.mainnet.value);
  });

  afterAll(() => closeWallet(wallet));
});
