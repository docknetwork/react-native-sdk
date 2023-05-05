import {createWallet, IWallet} from './wallet';
import {dockDocumentNetworkResolver} from './network-resolver';

describe('Wallet', () => {
  let wallet: IWallet;

  beforeEach(async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
      documentNetworkResolver: dockDocumentNetworkResolver,
    });
  });

  it('expect to add document to mainnet', async () => {
    const mockDocument = {
      id: 'test',
      type: 'VerifiableCredential',
    };

    await wallet.addDocument(mockDocument);

    const [result] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result.networkId).toEqual('mainnet');
    expect(result.id).toEqual(mockDocument.id);
  });

  it('expect to add document to testnet', async () => {
    const mockDocument = {
      id: 'test',
      type: 'VerifiableCredential',
    };

    wallet.setNetworkId('testnet');

    await wallet.addDocument(mockDocument);

    const [result] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result.networkId).toEqual('testnet');
    expect(result.id).toEqual(mockDocument.id);
  });

  it('expect to allow adding using the same document id in different networks', async () => {
    const mockDocument = {
      id: 'test',
      type: 'VerifiableCredential',
    };

    wallet.setNetworkId('mainnet');

    await wallet.addDocument(mockDocument);

    let [result] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result.networkId).toEqual('mainnet');
    expect(result.id).toEqual(mockDocument.id);

    wallet.setNetworkId('testnet');

    await wallet.addDocument(mockDocument);
  });

  it('expect to filter documents by network', async () => {
    const mockDocument = {
      id: 'test',
      type: 'VerifiableCredential',
    };

    wallet.setNetworkId('mainnet');

    await wallet.addDocument(mockDocument);

    let [result] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result.networkId).toEqual('mainnet');
    expect(result.id).toEqual(mockDocument.id);

    wallet.setNetworkId('testnet');

    [result] = await wallet.getDocumentsByType(mockDocument.type);
    expect(result).toBeUndefined();
  });
});
