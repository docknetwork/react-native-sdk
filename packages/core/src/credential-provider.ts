import {IWallet} from './types';

export interface ICredentialProvider {
  getCredentials(type?: string): any;
  isBBSPlusCredential(credential: any): boolean;
}

export function isBBSPlusCredential(credential) {
  return (
    (typeof credential?.proof?.type === 'string' &&
      credential.proof.type.includes('BBS+SignatureDock')) ||
    (Array.isArray(credential['@context']) &&
      credential['@context'].find(
        context => context.bs && context.bs.indexOf('bbs') > -1,
      ))
  );
}

export function createCredentialProvider({
  wallet,
}: {
  wallet: IWallet;
}): ICredentialProvider {
  function getCredentials(type: string = 'VerifiableCredential') {
    return wallet.getDocumentsByType(type);
  }

  return {
    getCredentials,
    isBBSPlusCredential,
    // TODO: move credential validity check to this provider
    // TODO: move import credential from json or URL to this provider
  };
}
