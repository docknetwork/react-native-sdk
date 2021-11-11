import {getWallet} from '../services/wallet';
import {WalletRpc} from './wallet-rpc';

const mnemonicEntity1 = {
  '@context': ['https://w3id.org/wallet/v1'],
  id: 'urn:uuid:c410e44a-9525-11ea-bb37-0242ac130002',
  name: 'Account 1',
  type: 'Mnemonic',
  value:
    'humble piece toy mimic miss hurdle smile awkward patch drama hurry mixture',
};

const mnemonicEntity2 = {
  '@context': ['https://w3id.org/wallet/v1'],
  id: 'urn:uuid:c410e44a-9525-11ea-bb37-0242ac133333',
  name: 'Account 2',
  type: 'Mnemonic',
  value:
    'humble piece toy mimic miss hurdle smile awkward patch drama hurry mixture',
};

const accountEntity = {
  '@context': ['https://w3id.org/wallet/v1'],
  id: '5DAqex3WuhWFJpXE3TFtDmAoJPiw4QGq1mVPoNz7Vh6B4iyB',
  type: 'Account',
  name: 'cocomelon',
  correlation: [mnemonicEntity2.id],
  meta: {
    hasBackup: false,
  },
};

describe('WalletRpc', () => {
  it('create', async () => {
    const walletId = 'dockWallet';
    const result = await WalletRpc.create(walletId);
    expect(result).toBe(walletId);
  });

  it('load', async () => {
    const result = await WalletRpc.load();
    expect(result).toBe(null);
  });

  it('status', async () => {
    const status = await WalletRpc.status();
    expect(status).toBe('UNLOCKED');
  });

  it('add mnemonic', async () => {
    const result = await WalletRpc.add(mnemonicEntity1);
    await WalletRpc.add(mnemonicEntity2);

    expect(result).toBe(null);
  });

  it('add account', async () => {
    const result = await WalletRpc.add(accountEntity);
    expect(result).toBe(null);
  });

  it('get accounts', async () => {
    const result = await WalletRpc.query({
      equals: {
        'content.type': 'Account',
      },
    });

    expect(result.length).toBe(1);
    expect(result[0]).toBe(accountEntity);
  });

  it('getStorageDocument', async () => {
    let result = await WalletRpc.getStorageDocument({
      id: mnemonicEntity1.id,
    });
    expect(result.content).toBe(mnemonicEntity1);

    result = await WalletRpc.getStorageDocument({
      id: mnemonicEntity2.id,
    });
    expect(result.content).toBe(mnemonicEntity2);

    result = await WalletRpc.getStorageDocument({
      id: accountEntity.id,
    });
    expect(result.content).toBe(accountEntity);
  });

  it('remove', async () => {
    await WalletRpc.remove(mnemonicEntity1.id);

    let result;
    let error;
    try {
      result = await WalletRpc.getStorageDocument({
        id: mnemonicEntity1.id,
      });
    } catch (err) {
      error = true;
    }

    expect(error).toBe(true);
    expect(result).toBe(undefined);
  });

  it('update', async () => {
    const doc = await WalletRpc.getStorageDocument({
      id: accountEntity.id,
    });

    expect(doc.content.meta.hasBackup).toBe(false);

    await WalletRpc.update({
      ...doc.content,
      meta: {
        ...doc.content.meta,
        hasBackup: true,
      },
    });

    const doc2 = await WalletRpc.getStorageDocument({
      id: accountEntity.id,
    });

    expect(doc2.content.meta.hasBackup).toBe(true);
  });

  it('toJSON', async () => {
    const result = await WalletRpc.toJSON();
    expect(result.id).toBe('dockWallet');
    expect(result.status).toBe('UNLOCKED');

    console.log(result);
  });

  it('exportWallet', async () => {
    // const result = await WalletRpc.export('*&test1234');
    // expect(result.id).toBe("dockWallet");
    // expect(result.status).toBe("UNLOCKED");
    // console.log(result);
  });

  it('exportAccount', async () => {
    const result = await WalletRpc.exportAccount(accountEntity.id, 'test');

    expect(result.address).toBe(accountEntity.id);
    expect(result.encoded).toBeDefined();
  });
});
