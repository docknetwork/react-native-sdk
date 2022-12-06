import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import {relayService} from '@docknetwork/wallet-sdk-core/lib/services/relay-service';
import type {WalletDocument} from '@docknetwork/wallet-sdk-core/lib/types';
import {assert} from '@docknetwork/wallet-sdk-core/lib/core/validation';
import axios from 'axios';
import {samplePresentationDefinition} from './samples';

export type Credential = {
  id: string,
  content: any,
};

export type CredentialInput = {
  content: any,
};

export class Credentials {
  static instance: Credentials;
  wallet: Wallet;

  constructor({wallet} = {}) {
    this.wallet = wallet || Wallet.getInstance();
  }

  validateCredential(content) {
    assert(!!content.type, 'Invalid credential');
  }

  /**
   * Add credential to the wallet
   *
   * @param credentialContent
   * @returns {Promise<Credential>}
   */
  async add(credentialContent: any): Promise<Credential> {
    assert(!!credentialContent, 'credentialContent is required');
    this.validateCredential(credentialContent);

    const doc = await this.wallet.add({
      value: credentialContent,
      type: 'VerifiableCredential',
    });

    return {
      id: doc.id,
      content: doc.value,
    };
  }

  /**
   * Fetch data from url
   *
   * @returns {Promise<any>}
   */
  async fetchData(url): Promise<any> {
    const {data} = await axios.get(url);
    return data;
  }

  /**
   * Return credential data from an URL if its valid
   *
   * @param url
   * @returns {Promise<*>}
   */
  async getCredentialFromUrl(url: string): Promise<Credential> {
    const data = await this.fetchData(url);

    this.validateCredential(data);

    return data;
  }
  /**
   * Downloads credential content from url and store in the wallet
   *
   * @param url
   * @returns Promise<Credential>
   */
  async addFromUrl(url: string): Promise<Credential> {
    const data = await this.fetchData(url);
    return this.add(data);
  }

  /**
   * Removes a credential
   *
   * @param credentialId
   * @returns {Promise<boolean>}
   */
  async remove(credentialId: string): Promise<boolean> {
    assert(!!credentialId, 'credentialId is required');
    return this.wallet.remove(credentialId);
  }

  /**
   * Query credentials
   *
   * @returns {Promise<Credential[]>}
   */
  async query(): Promise<Credential[]> {
    const documents = await this.wallet.query({
      type: 'VerifiableCredential',
    });

    return documents.map((document: WalletDocument) => ({
      content: document.value,
      id: document.id,
    }));
  }

  async getSamplePresentationDefinition() {
    return samplePresentationDefinition;
  }

  /**
   * Get instance
   *
   * @returns {Promise<Credentials>}
   */
  static getInstance(): Credentials {
    if (!this.instance) {
      this.instance = new Credentials();
    }

    return this.instance;
  }
}
