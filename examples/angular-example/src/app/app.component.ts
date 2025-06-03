import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { createDataStore } from '@docknetwork/wallet-sdk-data-store-web';
import { generateCloudWalletMasterKey } from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';
import { initializeCloudWallet } from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';
import { setLocalStorageImpl } from "@docknetwork/wallet-sdk-data-store-web/lib/localStorageJSON";

setLocalStorageImpl(global.localStorage);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'truvera-wallet';
  EDV_URL = 'https://edv.dock.io';
  EDV_AUTH_KEY = 'DOCKWALLET-TEST';

  ngOnInit(): void {
    this.init();
  }

  async init() {
    const dataStore = await createDataStore({
      databasePath: 'dock-wallet',
      defaultNetwork: 'testnet',
    });

    console.log(dataStore);

    try {
      // const newKeys = await edvService.generateKeys();
      // console.log("generated new keys for the wallet");
      // console.log(newKeys);
    } catch (error) {
      console.error('Error generating EDV keys:', error);
    }

    const { masterKey, mnemonic } = await generateCloudWalletMasterKey();
    console.log('Master Key:', masterKey);

    const { pullDocuments } = await initializeCloudWallet({
      dataStore,
      edvUrl: this.EDV_URL,
      authKey: this.EDV_AUTH_KEY,
      masterKey,
    });

    await pullDocuments();
  }
}
