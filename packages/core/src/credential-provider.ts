import {IWallet} from './types';

export interface ICredentialProvider {
  getCredentials(type?: string): any;
}

export function createCredentialProvider({wallet}: {wallet: IWallet}) {
  function getCredentials(type: string = 'VerifiableCredential') {
    return wallet.getDocumentsByType(type);
  }

  return {
    getCredentials,
    // TODO: move credential validity check to this provider
    // TODO: move import credential from json or URL to this provider
  };
}
