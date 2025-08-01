import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { createDataStore } from '@docknetwork/wallet-sdk-data-store-web';
import { initializeCloudWallet, generateCloudWalletMasterKey, recoverCloudWalletMasterKey } from '@docknetwork/wallet-sdk-core/lib/cloud-wallet';
import { createWallet } from '@docknetwork/wallet-sdk-core/lib/wallet';
import { createCredentialProvider } from '@docknetwork/wallet-sdk-core/lib/credential-provider';
import { createDIDProvider } from '@docknetwork/wallet-sdk-core/lib/did-provider';
import { createMessageProvider } from '@docknetwork/wallet-sdk-core/lib/message-provider';
import { createVerificationController } from '@docknetwork/wallet-sdk-core/lib/verification-controller';
import { setLocalStorageImpl } from '@docknetwork/wallet-sdk-data-store-web/lib/localStorageJSON';
import { getVCData } from '@docknetwork/prettyvc';

setLocalStorageImpl(global.localStorage);

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Truvera Wallet Angular Example';
  EDV_URL = 'https://edv.dock.io';
  EDV_AUTH_KEY = 'DOCKWALLET-TEST';

  // Loading states
  loading = false;
  cloudWalletLoading = false;

  // Wallet state
  masterKey: Uint8Array | null = null;
  mnemonic: string | null = null;
  mnemonicMessage: string | null = null;
  recoveryError: string | null = null;

  // Cloud wallet instances
  cloudWallet: any = null;
  wallet: any = null;
  credentialProvider: any = null;
  didProvider: any = null;
  messageProvider: any = null;
  dataStore: any = null;
  defaultDID: string | null = null;

  // Credentials
  documents: any[] = [];
  formattedCredentials: any[] = [];

  // Modal states
  importModalOpen = false;
  verifyModalOpen = false;
  recoverModalOpen = false;
  credentialUrl = '';
  proofRequestUrl = '';
  verifyStep = 1;
  selectedCredential: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadWalletKeys();
  }

  loadWalletKeys(): void {
    try {
      const keys = localStorage.getItem('keys');
      if (keys) {
        const parsedKeys = JSON.parse(keys);
        if (!parsedKeys.masterKey || !Array.isArray(parsedKeys.masterKey)) {
          throw new Error('Invalid master key format in localStorage');
        }

        this.masterKey = new Uint8Array(parsedKeys.masterKey);

        this.initializeCloudWallet();
      }
    } catch (err) {
      console.error('Error fetching wallet keys:', err);
    }
  }

  async initializeCloudWallet(): Promise<void> {
    if (!this.masterKey) {
      return;
    }

    this.cloudWalletLoading = true;
    try {
      const _dataStore = await createDataStore({
        databasePath: 'dock-wallet',
        defaultNetwork: 'testnet',
      });
      this.dataStore = _dataStore;


      const _cloudWallet = await initializeCloudWallet({
        dataStore: _dataStore,
        edvUrl: this.EDV_URL,
        masterKey: this.masterKey,
        authKey: this.EDV_AUTH_KEY,
      });
      this.cloudWallet = _cloudWallet;

      try {
        await _cloudWallet.pullDocuments();
      } catch (err) {
        console.error('Error pulling documents from EDV', err);
      }

      const documents = await _dataStore.documents.getAllDocuments();
      console.log('Documents:', documents);

      if (documents.length !== 0) {
        await this.provisionNewWallet();
      }

    } catch (err) {
      console.error('Error initializing cloud wallet', err);
    }
    this.cloudWalletLoading = false;
  }

  async provisionNewWallet(): Promise<void> {
    if (!this.masterKey || !this.dataStore) {
      return;
    }

    this.loading = true;

    try {
      const _wallet = await createWallet({ dataStore: this.dataStore });
      this.wallet = _wallet;

      const _credentialProvider = await createCredentialProvider({ wallet: _wallet });
      this.credentialProvider = _credentialProvider;

      const _didProvider = createDIDProvider({ wallet: _wallet });
      this.didProvider = _didProvider;
      this.defaultDID = await _didProvider.getDefaultDID();

      const _messageProvider = createMessageProvider({
        wallet: _wallet,
        didProvider: _didProvider,
      });
      this.messageProvider = _messageProvider;

      this.setupMessageListener();

      await this.refreshDocuments();
    } catch (err) {
      console.error('Error provisioning new wallet', err);
    }

    this.loading = false;
  }

  setupMessageListener(): void {
    if (!this.messageProvider || !this.credentialProvider) {
      return;
    }

    this.messageProvider.addMessageListener(async (message: any) => {
      console.log('Message received', message);

      if (message.body.credentials) {
        console.log('adding credential to the wallet');
        for (const credential of message.body.credentials) {
          await this.credentialProvider.addCredential(credential);
        }
        await this.refreshDocuments();
      }
    });
  }

  async refreshDocuments(): Promise<void> {
    if (!this.credentialProvider) {
      return;
    }

    const creds = await this.credentialProvider.getCredentials();
    this.formattedCredentials = await Promise.all(
      creds.map((c: any) =>
        getVCData(c, {
          generateImages: false,
          generateQRImage: false,
        }).catch((err: any) => c)
      )
    );
    this.documents = creds;
  }

  async recoverWallet(): Promise<void> {
    if (!this.mnemonic) {
      return;
    }

    this.loading = true;
    this.recoveryError = null;
    try {
      const masterKey = await recoverCloudWalletMasterKey(this.mnemonic);
      this.masterKey = masterKey;

      localStorage.setItem('keys', JSON.stringify({
        masterKey: Array.from(masterKey || []),
        // Mnemonic should not be stored in localStorage for security reasons
        // but we include it here for ease of recovery during development
        mnemonic: this.mnemonic
      }));

      this.initializeCloudWallet();
    } catch (error) {
      console.error('Error recovering wallet', error);
      this.recoveryError = 'Failed to recover wallet. Please check your mnemonic.';
    } finally {
      this.loading = false;
      this.closeRecoverWalletModal();
    }
  }

  async createNewWallet(): Promise<void> {
    this.loading = true;
    try {
      const { masterKey, mnemonic } = await generateCloudWalletMasterKey();
      this.masterKey = masterKey;
      this.mnemonicMessage = `Mnemonic (save this securely): ${mnemonic}`;

      console.log('Created new wallet');
      console.log('Mnemonic (save this securely):', mnemonic);

      localStorage.setItem('keys', JSON.stringify({
        masterKey: Array.from(masterKey),
        // Mnemonic should not be stored in localStorage for security reasons
        // but we include it here for ease of recovery during development
        mnemonic
      }));

      await this.initializeCloudWallet();
    } catch (err) {
      console.error('Error generating keys', err);
    }
    this.loading = false;
  }

  async importCredential(): Promise<void> {
    if (!this.credentialProvider || !this.didProvider) {
      return;
    }

    await this.credentialProvider.importCredentialFromURI({
      uri: this.credentialUrl,
      didProvider: this.didProvider,
    });

    await this.refreshDocuments();
    this.importModalOpen = false;
    this.credentialUrl = '';
  }

  async handleVerifyCredential(): Promise<void> {
    if (!this.wallet || !this.credentialProvider || !this.didProvider) {
      return;
    }

    this.loading = true;
    try {
      const proofRequest = await this.http.get(this.proofRequestUrl).toPromise();
      const controller = createVerificationController({
        wallet: this.wallet,
        credentialProvider: this.credentialProvider,
        didProvider: this.didProvider,
      });

      const credential = this.selectedCredential;

      await controller.start({ template: proofRequest });

      const attributesToReveal = ['credentialSubject.name'];

      controller.selectedCredentials.set(credential.id, {
        credential,
        attributesToReveal,
      });

      const presentation = await controller.createPresentation();

      console.log(presentation);

      try {
        const verificationResult = await this.http
          .post((proofRequest as any).response_url, presentation)
          .toPromise();

        console.log('Verification sent', { verificationResult });
        alert('Verification sent successfully');
      } catch (err: any) {
        console.error('Error sending verification', err);
        alert('Error sending verification: ' + err.error?.error);
      }
    } catch (err) {
      console.error('Error in verification process', err);
      alert('Error in verification process');
    }

    this.loading = false;
    this.closeVerifyModal();
  }

  async clearEDV(): Promise<void> {
    if (this.cloudWallet) {
      await this.cloudWallet.clearEdvDocuments();
    }
  }

  async fetchMessages(): Promise<void> {
    if (this.messageProvider) {
      await this.messageProvider.fetchMessages();
      await this.messageProvider.processDIDCommMessages();
    }
  }

  selectCredential(index: number): void {
    this.selectedCredential = this.documents[index];
  }

  copyDID(): void {
    if (this.defaultDID) {
      navigator.clipboard.writeText(this.defaultDID);
    }
  }

  clearWallet(): void {
    const currentKeys = localStorage.getItem('keys');
    localStorage.clear();
    if (currentKeys) {
      localStorage.setItem('keys', currentKeys);
    }
    window.location.reload();
  }

  openRecoverWalletModal(): void {
    this.recoverModalOpen = true;
    this.mnemonic = null;
  }

  closeRecoverWalletModal(): void {
    this.recoverModalOpen = false;
    this.mnemonic = null;
  }

  closeMnemonicMessage(): void {
    this.mnemonicMessage = null;
  }

  openImportModal(): void {
    this.importModalOpen = true;
    this.credentialUrl = '';
  }

  closeImportModal(): void {
    this.importModalOpen = false;
    this.credentialUrl = '';
  }

  openVerifyModal(): void {
    this.verifyModalOpen = true;
    this.verifyStep = 1;
    this.proofRequestUrl = '';
    this.selectedCredential = null;
  }

  closeVerifyModal(): void {
    this.verifyModalOpen = false;
    this.verifyStep = 1;
    this.proofRequestUrl = '';
    this.selectedCredential = null;
  }

  nextVerifyStep(): void {
    this.verifyStep = 2;
  }

  backVerifyStep(): void {
    this.verifyStep = 1;
  }
}
