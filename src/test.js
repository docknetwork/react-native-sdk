import { cryptoWaitReady } from "@polkadot/util-crypto";
import { getKeyring } from "./services/keyring";
import WalletService, { getWallet } from "./services/wallet";
import KeyringService from './services/keyring';
import { getAccountKeyring } from "./services/api";

const importWalletData = {"@context":["https://www.w3.org/2018/credentials/v1","https://w3id.org/wallet/v1"],"id":"did:key:z6LSs7dYJgMT7CXjcwNDRBWvbJrhrz8euoXGCH1qF5dXD2YE#encrypted-wallet","type":["VerifiableCredential","EncryptedWallet"],"issuer":"did:key:z6LSs7dYJgMT7CXjcwNDRBWvbJrhrz8euoXGCH1qF5dXD2YE","issuanceDate":"2022-01-05T13:21:58.413Z","credentialSubject":{"id":"did:key:z6LSs7dYJgMT7CXjcwNDRBWvbJrhrz8euoXGCH1qF5dXD2YE","encryptedWalletContents":{"protected":"eyJlbmMiOiJYQzIwUCJ9","recipients":[{"header":{"kid":"did:key:z6LSs7dYJgMT7CXjcwNDRBWvbJrhrz8euoXGCH1qF5dXD2YE#z6LSs7dYJgMT7CXjcwNDRBWvbJrhrz8euoXGCH1qF5dXD2YE","alg":"ECDH-ES+A256KW","epk":{"kty":"OKP","crv":"X25519","x":"K06rO_GH0clhFFl8fo4TpKxixPXZdG0jao1M2fnDLmA"},"apu":"K06rO_GH0clhFFl8fo4TpKxixPXZdG0jao1M2fnDLmA","apv":"ZGlkOmtleTp6NkxTczdkWUpnTVQ3Q1hqY3dORFJCV3ZiSnJocno4ZXVvWEdDSDFxRjVkWEQyWUUjejZMU3M3ZFlKZ01UN0NYamN3TkRSQld2YkpyaHJ6OGV1b1hHQ0gxcUY1ZFhEMllF"},"encrypted_key":"I4KYBCzF3zlNaAgQu4n-d7KOC5W1w-GhSJ4A2_nE9yuERBg_O6td9Q"}],"iv":"QLdMQR_oS9LqaYrXii9lDiClz49rujKJ","ciphertext":"LT2tPGc8vDpAmJusng_ql-8aJj0A5ndnn76Qe3hfkWCtXvidPg8OEkHWFIyAOj8K8tbqRtn7-WoL5fS9xufy1HvzUiZgs1KcCO0RNW0JM2R7kKMm1YSI2PUQ0QAkQMaEN0Qr6MhUkx0X-DrSxTa7FMIEB8codgjkeydcnnnLu0pl3gV-c-lsAHAE_djchBJkdLq6hUEa584LPJ5aWO-MLu-eeSflyUxU2fis8ezlyDCJtCe7azqmkc1-J1adTR6o-37ex3gOjF5rMO5VlNnBhf6-ZZ76IubkHpJPugcn0i_SmLFgk3eMG36mVYPki9U5rb2RmEDT9YNBJ7qgwVkYccIGMtdHbek_U1S6W6SM8P3KWf3cNq362LVWHusMhVxjXhOuCEYoA1ZH0u46aq2mQbf2JMLhMsiStAJWmyoeTGa3mr4pok_uW9PVEMIJHXhA3M7aP-9LpZqWShUKBVbSFzdOqJKNeOrftLfPLZoIUFbslunxAmh03NbX5qhA9QcPhzU","tag":"gPbaFMieFbYGTV2y8GJl8g"}}};



  async function importWallet()  {
    await cryptoWaitReady();
    await WalletService.routes.create("wallet");
    await WalletService.routes.load();
    await WalletService.routes.sync();
    // await WalletService.routes.add({
    //   "@context": ["https://w3id.org/wallet/v1"],
    //   id: "test",
    //   type: "Account",
    //   correlation: ["1"],
    // });
    
    // await WalletService.routes.sync();
    
    // const result = await WalletService.routes.exportWallet('test123');

    // console.log(JSON.stringify(result).length);
    await WalletService.routes.importWallet(importWalletData, '12345678Qw!');

    
    let accounts = await WalletService.routes.query({
      equals: {
        'content.type': 'Account',
      },
    });
    // await WalletService.routes.load();
    // await WalletService.routes.sync();
    
    console.log(getWallet().storageInterface);
    console.log(accounts);
  }

  
  async function exportAccount()  {
    await cryptoWaitReady();
    await WalletService.routes.create("wallet");
    await WalletService.routes.load();
    await WalletService.routes.sync();
    // await WalletService.routes.create("wallet");
    // await WalletService.routes.load();
    // await WalletService.routes.sync();
    
    
    const keypair = getKeyring().addFromMnemonic('scale hold evidence moment reward garbage spider sign admit omit mimic frame');
    const keyPairJson = KeyringService.routes.addFromJson(keypair.toJson('test'), `test`);
    
    // console.log(keyPairJson);
    // const
    await WalletService.routes.add({
      '@context': ['https://w3id.org/wallet/v1'],
      id: 'secret',
      name: 'test account',
      type: 'KeyPair',
      value: keyPairJson,
    });
    await WalletService.routes.add({
      "@context": ["https://w3id.org/wallet/v1"],
      id: keypair.address,
      type: "Account",
      correlation: ["secret"],
    });
    
    // await WalletService.routes.sync();
    
    // const result = await WalletService.routes.exportWallet('test123');

    // console.log(JSON.stringify(result).length);
    // await WalletService.routes.importWallet(importWalletData, '12345678Qw!');

    
    // const accountKeyring = await getAccountKeyring(keypair.address);
    
    
    const b = await WalletService.routes.exportAccount(keypair.address, 'test');
    console.log(b);
    // let accounts = await WalletService.routes.query({
    //   equals: {
    //     'content.type': 'Account',
    //   },
    // });
    // await WalletService.routes.load();
    // await WalletService.routes.sync();
    
    // console.log(getWallet().storageInterface);
    // console.log(accounts);
  }

  
  // main();

  
  exportAccount();