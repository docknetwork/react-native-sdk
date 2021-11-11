import {cryptoWaitReady} from '@polkadot/util-crypto';
import {KeyringRpc} from './keyring-rpc';
import {UtilCryptoRpc} from './util-crypto-rpc';

describe('KeyringRpc', () => {
  beforeAll(cryptoWaitReady);

  it('initialize', async () => {
    const result = await KeyringRpc.initialize();
    expect(result).toBe(true);
  });

  it('addFromMnemonic', async () => {
    const mnemonic = await UtilCryptoRpc.mnemonicGenerate();
    const result = await KeyringRpc.addFromMnemonic(mnemonic);

    expect(result.address).toBeDefined();
  });

  describe('addFromJson', () => {
    it('with success', async () => {
      const jsonData = {
        encoded:
          'a94pnHfOuh/27N07XBFK+g2THMhuVxOJrpVOzEF+VHgAgAAAAQAAAAgAAAAKLbYS5ZcPQFvhrr6ZdPBk0qZyqEwSbp/LnCh6x/K3E7tEszYoh2/KrDmI+J7LZFvnEv2TQucr1c6Eg/Qup5pzLu/RLn0eaoBdFQ8BgGyo3c2zLye5P1XcRePfNVhw+APJ/Uqkv5LUqMFEEEJEzBJg/Flqz6ZG6S3iOV9PEV5v6xvKvzPATR4mZCA5UljXz+j7JKUEMyg5MxoPscEp',
        encoding: {
          content: ['pkcs8', 'sr25519'],
          type: ['scrypt', 'xsalsa20-poly1305'],
          version: '3',
        },
        address: '3GoLUwuovRemYomjQGqD5Wo7ZEY2mTgw95iJPPaKhnPTzVVW',
        meta: {
          genesisHash:
            '0xf73467c6544aa68df2ee546b135f955c46b90fa627e9b5d7935f41061bb8a5a9',
          name: 'test',
          tags: [],
          whenCreated: 1622563948125,
          meta: {
            genesisHash:
              '0xf73467c6544aa68df2ee546b135f955c46b90fa627e9b5d7935f41061bb8a5a9',
          },
        },
      };
      const result = await KeyringRpc.addFromJson(jsonData, 'test');

      expect(result.address).toBeDefined();
    });

    it('wrong password', async () => {
      const jsonData = {
        encoded:
          'a94pnHfOuh/27N07XBFK+g2THMhuVxOJrpVOzEF+VHgAgAAAAQAAAAgAAAAKLbYS5ZcPQFvhrr6ZdPBk0qZyqEwSbp/LnCh6x/K3E7tEszYoh2/KrDmI+J7LZFvnEv2TQucr1c6Eg/Qup5pzLu/RLn0eaoBdFQ8BgGyo3c2zLye5P1XcRePfNVhw+APJ/Uqkv5LUqMFEEEJEzBJg/Flqz6ZG6S3iOV9PEV5v6xvKvzPATR4mZCA5UljXz+j7JKUEMyg5MxoPscEp',
        encoding: {
          content: ['pkcs8', 'sr25519'],
          type: ['scrypt', 'xsalsa20-poly1305'],
          version: '3',
        },
        address: '3GoLUwuovRemYomjQGqD5Wo7ZEY2mTgw95iJPPaKhnPTzVVW',
        meta: {
          genesisHash:
            '0xf73467c6544aa68df2ee546b135f955c46b90fa627e9b5d7935f41061bb8a5a9',
          name: 'test',
          tags: [],
          whenCreated: 1622563948125,
          meta: {
            genesisHash:
              '0xf73467c6544aa68df2ee546b135f955c46b90fa627e9b5d7935f41061bb8a5a9',
          },
        },
      };
      let result;

      try {
        await KeyringRpc.addFromJson(jsonData, 'test3');
      } catch (err) {
        result = err;
      }

      expect(result.toString()).toBe(
        'Error: Unable to decode using the supplied passphrase',
      );
    });
  });

  it('addressFromUri', async () => {
    const phrase =
      'scale hold evidence moment reward garbage spider sign admit omit mimic frame';
    const type = 'sr25519';
    const derivePath = '';
    const address = await KeyringRpc.addressFromUri({
      phrase,
      type,
      derivePath,
    });

    expect(address).toBeDefined();
  });
});
