import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/src/wallet';

describe('Custom networks', () => {
  let wallet: IWallet;
  const networks = [
    {
      name: 'polygon',
      id: 'polygon',
      configs: '{}',
    },
    {
      name: 'Polygon mumbai',
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

  beforeEach(async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
      networks,
    });
    await wallet.addDocument(mockDocuments.mainnet);
  });

  it('should have documents only on mainnet', async () => {
    const [doc] = await wallet.getAllDocuments();
    expect(doc.value).toEqual(mockDocuments.mainnet.value);

    wallet.setNetworkId('mumbai');

    let mumbaiDocs = await wallet.getAllDocuments();

    expect(mumbaiDocs).toHaveLength(0);
  });

  it('should add document to mumbai without affecting polygon', async () => {
    wallet.setNetworkId('mumbai');

    await wallet.addDocument(mockDocuments.testnet);
    let [doc] = await wallet.getAllDocuments();
    expect(doc.value).toEqual(mockDocuments.testnet.value);

    wallet.setNetworkId('polygon');
    const allDocs = await wallet.getAllDocuments();
    [doc] = allDocs;
    expect(allDocs).toHaveLength(1);
    expect(doc.value).toEqual(mockDocuments.mainnet.value);
  });
});
