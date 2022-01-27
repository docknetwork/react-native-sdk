import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import {Accounts} from '@docknetwork/wallet-sdk-core/lib/modules/accounts';
import {UtilCryptoRpc} from '@docknetwork/wallet-sdk-core/lib/client/util-crypto-rpc';

async function main() {
  const wallet = await Wallet.create({
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

  // await wallet.add({
  //   type: 'DID'
  // });

  // // Returns just addresses
  // const searchResult = await wallet.query({
  //   type: 'Currency',
  // });

  // const accounts = Accounts.getInstance();

  // const mnemonic = await accounts.generateMnemonic();
  // const myAccounts = await accounts.create({
  //   keyPairType: '',
  //   mnemonic
  // });

  // const allAccounts = accounts.getAccounts();
}

main();
