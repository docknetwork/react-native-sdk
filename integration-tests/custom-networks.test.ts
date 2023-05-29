import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/src/wallet';
import {Network} from '@docknetwork/wallet-sdk-data-store/src/types';

describe('Custom networks', () => {
  let wallet: IWallet;
  const networks: Network[] = [
    {
      name: 'polygon',
      credentialHostnames: ['creds.polygon.com'],
      id: 'polygon',
      configs: '{}',
    },
    {
      name: 'Polygon mumbai',
      credentialHostnames: ['creds.mumbai.polygon.com'],
      id: 'mumbai',
      configs: '{}',
    },
  ];

  const mockDocuments = {
    mainnet: {
      value: 'mainnet doc',
      type: 'JWT-VC',
    },
    testnet: {
      value: 'testnet doc',
      type: 'JWT-VC',
    },
  };

  beforeAll(async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
      networks,
    });
    await wallet.addDocument(mockDocuments.mainnet);
  });

  it('should have documents only on mainnet', async () => {
    const [doc] = await wallet.getAllDocuments();
    expect(doc.value).toEqual(mockDocuments.mainnet.value);

    wallet.setNetwork('mumbai');

    let mumbaiDocs = await wallet.getAllDocuments();

    expect(mumbaiDocs).toHaveLength(0);
  });

  it('should add document to mumbai without affecting polygon', async () => {
    wallet.setNetwork('mumbai');

    await wallet.addDocument(mockDocuments.testnet);
    let [doc] = await wallet.getAllDocuments();
    expect(doc.value).toEqual(mockDocuments.testnet.value);

    wallet.setNetwork('polygon');
    const allDocs = await wallet.getAllDocuments();
    [doc] = allDocs;
    expect(allDocs).toHaveLength(1);
    expect(doc.value).toEqual(mockDocuments.mainnet.value);
  });

  afterAll(async () => {
    return new Promise((res) => {
      setTimeout(() => {
        res(wallet.dataStore.db.destroy());
      }, 400);
    });
  });
});
