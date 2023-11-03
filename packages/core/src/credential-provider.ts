import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';
import {IWallet} from './types';

export interface ICredentialProvider {
  getCredentials(type?: string): any;
  isBBSPlusCredential(credential: any): boolean;
  isValid(credential: any, forceFetch?: boolean): Promise<boolean>;
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

type Credential = any;

/**
 * Uses Dock SDK to verify a credential
 * @param credential
 * @returns
 */
export async function isValid(credential: Credential, forceFetch?: boolean) {
  try {
    // get status from localStorage cache
    // if its valid, then return cached data

    // if invalid or not found in cache, then fetch and save cache
    const result = await credentialServiceRPC.verifyCredential({
    });
    

    debugger;
    return result;
  } catch (err) {
    debugger;
  }
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
    isValid,
    // TODO: move import credential from json or URL to this provider
  };
}
