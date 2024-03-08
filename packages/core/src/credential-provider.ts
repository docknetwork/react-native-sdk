import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';
import {IWallet} from './types';
import assert from 'assert';
import { dockService } from '@docknetwork/wallet-sdk-wasm/src/services/dock';

export type Credential = any;

export interface ICredentialProvider {
  getCredentials(type?: string): Credential[];
  getById(id: string): Credential;
  getMembershipWitness(credential: any): Promise<any>;
  isBBSPlusCredential(credential: any): boolean;
  isValid(credential: any, forceFetch?: boolean): Promise<boolean>;
  addCredential(credential: any): Promise<Credential>;
  syncCredentialStatus(params: SyncCredentialStatusParams): Promise<CredentialStatusDocument[]>;
  getCredentialStatus(credential: Credential): Promise<{status: string, error?: string}>;
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

function isCredentialExpired(credential) {
  return credential.expirationDate
    ? isInThePast(new Date(credential.expirationDate))
    : false;
}

function isCredentialRevoked(error) {
  return (
    typeof error === 'string' && error.toLowerCase().includes('revocation')
  );
}

export function isInThePast(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Uses Dock SDK to verify a credential
 * @param credential
 * @returns
 */
export async function isValid({
  credential,
  wallet,
}: {
  credential: Credential;
  wallet: IWallet;
}) {
  assert(!!credential, 'credential is required');

  try {
    if (isCredentialExpired(credential)) {
      return {
        status: CredentialStatus.Expired,
      };
    }

    const membershipWitness = credential[ACUMM_WITNESS_PROP_KEY] || await getMembershipWitness({
      credentialId: credential.id,
      wallet,
    });

    delete credential[ACUMM_WITNESS_PROP_KEY];

    const verificationResult = await credentialServiceRPC.verifyCredential({
      credential,
      membershipWitness,
    });
    
    const { verified, error }  = verificationResult;
  
    if (!verified) {
      if (isCredentialRevoked(error)) {
        return {
          status: CredentialStatus.Revoked,
          error,
        };
      }

      return {
        status: CredentialStatus.Invalid,
        error: error,
      };
    }

    return {
      status: CredentialStatus.Verified,
    };
  } catch (err) {
    console.error(err);

    return {
      status: CredentialStatus.Invalid,
      error: err.toString(),
    };
  }
}

export const ACUMM_WITNESS_PROP_KEY = '$$accum__witness$$';

export async function addCredential({wallet, credential}) {
  const acummWitness = credential[ACUMM_WITNESS_PROP_KEY];

  if (acummWitness) {
    delete credential[ACUMM_WITNESS_PROP_KEY];
  }

  const response = await wallet.addDocument(credential);

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

async function getMembershipWitness({credentialId, wallet}) {
  const document = await wallet.getDocumentById(`${credentialId}#witness`);
  return document?.value;
}


export const CredentialStatus = {
  Invalid: 'invalid',
  Expired: 'expired',
  Verified: 'verified',
  Revoked: 'revoked',
  Pending: 'pending',
};

type SyncCredentialStatusParams = {
  // Optional credential IDs to sync
  credentialIds?: string[],
  // Skip the cache and re-fetch from the chain
  forceFetch?: boolean,
};

type CredentialStatusDocument = {
  id: string;
  status: string;
  error: string;
}

/**
 * Fetch credential status from the chain and update the wallet
 * Store a new document <credentialId>#status in the wallet
 * Returns a list of CredentialStatusDocument
 * 
 * @param param0
 * @returns CredentialStatusDocument[]
 */
async function syncCredentialStatus({ wallet, credentialIds, forceFetch }: SyncCredentialStatusParams & {
  wallet: IWallet;
} ): Promise<CredentialStatusDocument[]> {
  let credentials;

  if (credentialIds && credentialIds.length) {
    for (const credentialId of credentialIds) {
      const credential = await wallet.getDocumentById(credentialId);
      if (credential) {
        credentials.push(credential);
      }
    }
  } else {
    credentials = await wallet.getDocumentsByType('VerifiableCredential');
  }

  let statusDocs = [];

  let isApiConnected;
  
  for (const credential of credentials) {
    let shouldFetch = !!forceFetch;
    let statusDoc = await wallet.getDocumentById(`${credential.id}#status`);

    if (!statusDoc) {
      shouldFetch = true;
      statusDoc = {
        type: 'CredentialStatus',
        id: `${credential.id}#status`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: null,
      };

      await wallet.addDocument(statusDoc);
    }

    statusDocs.push(statusDoc);

    if (!statusDoc.status || statusDoc.status === CredentialStatus.Pending) {
      shouldFetch = true;
    }

    if (!shouldFetch) {
      // check if latest fetch was more than 24 hours ago
      const updatedAt = new Date(statusDoc.updatedAt);
      const diff = new Date().getTime() - updatedAt.getTime();
      const hours = Math.floor(diff / 1000 / 60 / 60);
      if (hours > 24) {
        shouldFetch = true;
      }
    }

    if (!shouldFetch) {
      continue;
    }

    statusDoc.status = CredentialStatus.Pending;
    statusDoc.updatedAt = new Date().toISOString();

    await wallet.updateDocument(statusDoc);

    if (!isApiConnected) {
      await dockService.ensureDockReady();
      isApiConnected = true;
    }    

    const result = await isValid({ credential, wallet });
    statusDoc.status = result?.status
    statusDoc.error = result?.error;
    statusDoc.updatedAt = new Date().toISOString();

    await wallet.updateDocument(statusDoc);
  }

  return statusDocs;
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
    getMembershipWitness: async (credentialId: string) =>
      getMembershipWitness({credentialId, wallet}),
    getById: (id: string) => wallet.getDocumentById(id),
    isBBSPlusCredential,
    isValid: async credential =>
      isValid({
        credential,
        wallet,
      }) as any,
    getCredentialStatus: async (credential: Credential) => {
      assert(!!credential, 'credential is required');

      if (isCredentialExpired(credential)) {
        return {
          status: CredentialStatus.Expired,
        };
      }

      const statusDoc = await wallet.getDocumentById(`${credential.id}#status`);

      return {
        status: statusDoc?.status || CredentialStatus.Pending,
        error: statusDoc?.error,
      }
    },
    syncCredentialStatus: async (props: SyncCredentialStatusParams) => {
      return syncCredentialStatus({ wallet, ...props });
    },
    addCredential: credential => addCredential({wallet, credential}),
    // TODO: move import credential from json or URL to this provider
  };
}
