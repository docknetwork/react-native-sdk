import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';
import {IWallet} from './types';

export type Credential = any;

export interface ICredentialProvider {
  getCredentials(type?: string): Credential[];
  getById(id: string): Credential;
  getMembershipWitness(credential: any): Promise<any>;
  isBBSPlusCredential(credential: any): boolean;
  isValid(credential: any, forceFetch?: boolean): Promise<boolean>;
  addCredential(credential: any): Promise<Credential>;
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

/**
 * Uses Dock SDK to verify a credential
 * @param credential
 * @returns
 */
export async function isValid(credential: Credential, forceFetch?: boolean) {
  try {
    const result = await credentialServiceRPC.verifyCredential({
      credential,
    });

    return result;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export const ACUMM_WITNESS_PROP_KEY = '$$accum__witness$$';

export async function addCredential({ wallet, credential }) {
  const acummWitness = credential[ACUMM_WITNESS_PROP_KEY];

  if (acummWitness) {
    delete credential[ACUMM_WITNESS_PROP_KEY];
  }

  const response = await wallet.addDocument(credential);;

  if (acummWitness) {
    await wallet.addDocument({
      type: 'AccumulatorWitness',
      id: `${credential.id}#witness`,
      value: acummWitness,
      initialWitness: acummWitness,
    });
  }

  return response;
}

export function createCredentialProvider({
  wallet,
}: {
  wallet: IWallet;
}): ICredentialProvider {
  function getCredentials(type: string = 'VerifiableCredential') {
    return wallet.getDocumentsByType(type) as any;
  }

  return {
    getCredentials,
    getMembershipWitness: async (credentialId: string) => {
      const document = await wallet.getDocumentById(`${credentialId}#witness`);
      return document?.value;
    },
    getById: (id: string) => wallet.getDocumentById(id),
    isBBSPlusCredential,
    isValid,
    addCredential:(credential) => addCredential({ wallet, credential }),
    // TODO: move import credential from json or URL to this provider
  };
}
