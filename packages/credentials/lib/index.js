import {Wallet} from '@docknetwork/wallet-sdk-core/lib/modules/wallet';
import type {WalletDocument} from '@docknetwork/wallet-sdk-core/lib/types';
import {assert} from '@docknetwork/wallet-sdk-core/lib/core/validation';
import axios from 'axios';
import queryString from 'query-string';
import {credentialService} from '@docknetwork/wallet-sdk-core/lib/services/credential/service';

export type Credential = {
  id: string,
  content: any,
};

export type CredentialInput = {
  content: any,
};

// TODO: Refactor this method, add tests
// It was moved from the dock-app repo
export function getParamsFromUrl(url, param) {
  const startOfQueryParams = url.indexOf('?');

  const parsed = queryString.parse(url.substring(startOfQueryParams));
  return parsed[param] ? parsed[param] : '';
}

// The issuer (the assigner) is prohibiting verifiers (the assignee) from storing the data in an archive.
function generatePolicyNoArchiveStore(id, assigner) {
  return {
    type: 'IssuerPolicy',
    id: 'https://ld.dock.io/policies/credential/1',
    prohibition: [
      {
        assigner,
        assignee: 'AllVerifiers',
        target: id,
        action: ['Archival'],
      },
    ],
  };
}

export function generateAuthVC({controller}, credentialSubject) {
  assert(!!controller);
  assert(!!credentialSubject);

  const AUTHCRED_EXPIRY_MINS = 10;
  const expirationDate = new Date(
    new Date().getTime() + AUTHCRED_EXPIRY_MINS * 60000,
  );
  const id = `didauth:${credentialSubject.state}`;
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      {
        dk: 'https://ld.dock.io/credentials#',
        DockAuthCredential: 'dk:DockAuthCredential',
        name: 'dk:name',
        email: 'dk:email',
        state: 'dk:state',
        IssuerPolicy: 'dk:IssuerPolicy',
        AllVerifiers: 'dk:AllVerifiers',
        Archival: 'dk:Archival',
        prohibition: 'dk:prohibition',
        action: 'dk:action',
        assignee: 'dk:assignee',
        assigner: 'dk:assigner',
        target: 'dk:target',
      },
    ],
    termsOfUse: [generatePolicyNoArchiveStore(id, controller)],
    id,
    type: ['VerifiableCredential', 'DockAuthCredential'],
    credentialSubject,
    expirationDate: expirationDate.toISOString(),
  };
}

const isDIDDockRegex = /did:dock/gi;

export function ensureDIDDockFragment(keyDoc) {
  if (!isDIDDockRegex.test(keyDoc.id)) {
    return keyDoc;
  }

  keyDoc.id = keyDoc.id.replace(/#.+/, '');
  keyDoc.id = `${keyDoc.id}#keys-1`;

  return keyDoc;
}

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

  getWeb3IDReturnURL(web3IDUrl) {
    const url = new URL(web3IDUrl);
    const searchParams = new URLSearchParams(url.searchParams);
    return searchParams.get('url');
  }

  async getWeb3IDVC({url, keyDoc, profile}) {
    keyDoc = ensureDIDDockFragment(keyDoc);

    const verifiableCredential = generateAuthVC(keyDoc, {
      ...profile,
      state: getParamsFromUrl(this.getWeb3IDReturnURL(url), 'id'),
    });

    if (verifiableCredential.context) {
      throw new Error('context should not be defined');
    }

    const signedCredential = await credentialService.signCredential({
      vcJson: verifiableCredential,
      keyDoc,
    });

    delete signedCredential.context;

    return signedCredential;
  }

  async verifyCredential(vc) {
    return credentialService.verifyCredential(vc);
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
