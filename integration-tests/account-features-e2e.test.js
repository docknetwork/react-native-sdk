import {
  Wallet,
  WalletDocument,
} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import {Accounts} from '@docknetwork/wallet-sdk-core/lib/modules/accounts';
import {getKeyringPair} from '@docknetwork/wallet-sdk-core/lib/services/keyring';
import {ApiRpc} from '@docknetwork/wallet-sdk-core/lib/client/api-rpc';

describe('Wallet integration test', () => {
  let wallet: Wallet;

  it('Create wallet + add accounts + get account balance + get transaction fee', async () => {
      wallet = await Wallet.create({
        json: {
          '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://w3id.org/wallet/v1',
          ],
          id: 'did:key:z6LSs7dYJgMT7CXjcwNDRBWvbJrhrz8euoXGCH1qF5dXD2YE#encrypted-wallet',
          type: ['VerifiableCredential', 'EncryptedWallet'],
          issuer: 'did:key:z6LSs7dYJgMT7CXjcwNDRBWvbJrhrz8euoXGCH1qF5dXD2YE',
          issuanceDate: '2022-01-26T18:09:04.178Z',
          credentialSubject: {
            id: 'did:key:z6LSs7dYJgMT7CXjcwNDRBWvbJrhrz8euoXGCH1qF5dXD2YE',
            encryptedWalletContents: {
              protected: 'eyJlbmMiOiJYQzIwUCJ9',
              recipients: [
                {
                  header: {
                    kid: 'did:key:z6LSs7dYJgMT7CXjcwNDRBWvbJrhrz8euoXGCH1qF5dXD2YE#z6LSs7dYJgMT7CXjcwNDRBWvbJrhrz8euoXGCH1qF5dXD2YE',
                    alg: 'ECDH-ES+A256KW',
                    epk: {
                      kty: 'OKP',
                      crv: 'X25519',
                      x: '4C8mVzZlEgwqmXTTNFhVg8-Doh7FAOtzOqkSwIthwCo',
                    },
                    apu: '4C8mVzZlEgwqmXTTNFhVg8-Doh7FAOtzOqkSwIthwCo',
                    apv: 'ZGlkOmtleTp6NkxTczdkWUpnTVQ3Q1hqY3dORFJCV3ZiSnJocno4ZXVvWEdDSDFxRjVkWEQyWUUjejZMU3M3ZFlKZ01UN0NYamN3TkRSQld2YkpyaHJ6OGV1b1hHQ0gxcUY1ZFhEMllF',
                  },
                  encrypted_key:
                    'Mp3pT9ftpodo274A_kiVlKEl3G8jy1YqACK8kb9ghOngsfT870EO7A',
                },
              ],
              iv: 'g4g09o27t94YqA4aZwYrUMGUPsrqt9Eh',
              ciphertext: 'YlmEbaBOKKFGxnvBuRdI',
              tag: 'XijyxZARhTHpLUZ-HDau7w',
            },
          },
        },
        password: '12345678Qw!',
      });
    
      const docs = await wallet.query();
      console.log(docs);
      
      // wallet = await Wallet.create();

      // console.log('test 2');

      // const account = await wallet.accounts.create({
      //   name: 'test',
      // });

      // console.log('test');

      // console.log(`Account address ${account.address}`);

      // console.log(`Account address ${account.address}`);
      // console.log(`Account address ${account.address}`);
      // console.log(`Account address ${account.address}`);

      // const documents = await wallet.query();
      // const mnemonic = 'indicate mention thing discover clarify grief inherit vivid dish health market spoil';
      // const account = await accounts.create({
      //   name: 'Test',
      //   mnemonic,
      // });

      // const keypair = await getKeyringPair({ mnemonic });

      // expect(account.address).toBe('39SiPt8AHxtThrWZNcQadD1MA7WAcmcedC89hqcU22ZYrJn2');

      // await accounts.fetchBalance(account.id);
  });

  // afterAll(async() => {
  //   await wallet.close();
  // });
});
