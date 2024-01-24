import {IWallet} from './types';

export interface ICredentialProvider {
  getCredentials(type?: string): any;
  isBBSPlusCredential(credential: any): boolean;
  addCredential(credential: any): Promise<any>;
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

export async function addCredential({ wallet, credential }) {
  const acummWitness = credential['$$accum_witness$$'];

  if (acummWitness) {
    delete credential['$$accum_witness$$'];
  }

  const response = await wallet.addDocument(credential);;

  if (!acummWitness) {
    await wallet.addDocument({
      type: 'AccumulatorWitness',
      id: `${credential.id}#witness`,
      value: acummWitness,
    })
  }

  return response;
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
    addCredential:(credential) => addCredential({ wallet, credential }),
    // TODO: move credential validity check to this provider
    // TODO: move import credential from json or URL to this provider
  };
}
