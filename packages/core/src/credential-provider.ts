import {IWallet} from './types';

export type Credential = any;

export interface ICredentialProvider {
  getCredentials(type?: string): Credential[];
  getById(id: string): Credential;
  getMembershipWitness(credential: any): Promise<any>;
  isBBSPlusCredential(credential: any): boolean;
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
    addCredential:(credential) => addCredential({ wallet, credential }),
    // TODO: move credential validity check to this provider
    // TODO: move import credential from json or URL to this provider
  };
}
