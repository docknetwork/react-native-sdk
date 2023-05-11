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

  it('should create a wallet with custom networks', async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
      networks,
    });
  });

  it('should add documents to polygon network', async () => {
    await wallet.addDocument({
      value: '<some-jwt-data>',
      type: 'JWT-VC',
    });
  });

  it('should switch to mumbai network and have an empty wallet', async () => {
    wallet.setNetworkId('mumbai');

    let documents = await wallet.getAllDocuments();

    expect(documents).toHaveLength(0);

    await wallet.addDocument({
      value: '<some-jwt-data>',
      type: 'JWT-VC',
    });

    documents = await wallet.getAllDocuments();

    expect(documents).toHaveLength(1);
  });

  it('should switch back to polygon network and have a document', async () => {
    wallet.setNetworkId('polygon');
    const documents = await wallet.getAllDocuments();

    expect(documents).toHaveLength(1);
  });
});
