import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';
import {IWallet} from './types';
import assert from 'assert';
import {blockchainService} from '@docknetwork/wallet-sdk-wasm/src/services/blockchain';
import {acquireOpenIDCredentialFromURI} from './credentials/oidvc';
import {IDIDProvider} from './did-provider';

export type Credential = any;

export interface ICredentialProvider {
  getCredentials(type?: string): Credential[];
  getById(id: string): Credential;
  getMembershipWitness(credential: any): Promise<any>;
  isBBSPlusCredential(credential: any): boolean;
  isValid(credential: any, forceFetch?: boolean): Promise<{
    status: string;
    error?: string;
    warning?: string;
  }>;
  addCredential(credential: any): Promise<Credential>;
  importCredentialFromURI(
    params: importCredentialFromUriParams,
  ): Promise<Credential>;
  syncCredentialStatus(
    params: SyncCredentialStatusParams,
  ): Promise<CredentialStatusDocument[]>;
  getCredentialStatus(
    credential: Credential,
  ): Promise<{status: string; error?: string}>;
  removeCredential(credential: Credential): Promise<void>;
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

type importCredentialFromUriParams = {
  uri: string;
  didProvider: IDIDProvider;
  getAuthCode?: (authorizationURL: string) => Promise<string>;
};

export async function importCredentialFromURI({
  uri,
  wallet,
  didProvider,
  getAuthCode,
}: importCredentialFromUriParams & {
  wallet: IWallet;
}) {
  // TODO: unify the impl with the existing import credential flow
  // if the URI is an OpenID credential offer, use the OpenID flow
  // if the URI is a dock credential, then get user password and import that
  // we can add support for other types of credentials later
  const credential = await acquireOpenIDCredentialFromURI({
    didProvider,
    uri,
    getAuthCode,
  });

  await addCredential({wallet, credential});
}

export function isCredentialExpired(credential) {
  return (
    !!credential.expirationDate &&
    new Date(credential.expirationDate) < new Date()
  );
}

/**
 * Uses Dock SDK to verify a credential
 * @param credential
 * @returns {Promise<Object>} Verification result with status and optional error/warning messages
 */
export async function isValid({
  credential,
  wallet,
}: {
  credential: Credential;
  wallet: IWallet;
}): Promise<{
  status: string;
  error?: string;
  warning?: string;
}> {
  assert(!!credential, 'credential is required');

  try {
    if (isCredentialExpired(credential)) {
      return {
        status: CredentialStatus.Expired,
      };
    }

    const membershipWitness =
      credential[ACUMM_WITNESS_PROP_KEY] ||
      (await getMembershipWitness({
        credentialId: credential.id,
        wallet,
      }));

    delete credential[ACUMM_WITNESS_PROP_KEY];

    const verificationResult = await credentialServiceRPC.verifyCredential({
      credential,
      membershipWitness,
    });

    const {verified, error} = verificationResult;

    if (error) {
      const sdkNotInitialized = error?.errors?.find(err => err?.message === 'SDK is not initialized');
      if (sdkNotInitialized) {
        throw new Error(
          'SDK is not initialized. Please ensure the blockchain is connected.',
        );
      }
    }

    if (!verified) {
      if (
        typeof error === 'string' &&
        error.toLowerCase().includes('revocation')
      ) {
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
    // Handle unknown error, when we can't determine the status
    // Potential reasons can be network error, blockchain offline, internal SDK error
    console.error(err);

    // in this case we return the cached status if possible
    // It will avoid showing unknown status in case of a network error
    const statusDoc = await wallet.getDocumentById(`${credential.id}#status`);

    if (statusDoc) {
      return {
        ...statusDoc,
        warning: 'unable_to_refresh_status',
      };
    }

    // Return pending status
    // As we can't determine the status, and there is no cached status
    return {
      status: CredentialStatus.Pending,
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

  syncCredentialStatus({wallet, credentialIds: [credential.id]});

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
  credentialIds?: string[];
  // Skip the cache and re-fetch from the chain
  forceFetch?: boolean;
};

type CredentialStatusDocument = {
  id: string;
  status: string;
  error: string;
  warning?: string;
};

/**
 * Fetch credential status from the chain and update the wallet
 * Store a new document <credentialId>#status in the wallet
 * Returns a list of CredentialStatusDocument
 *
 * @param param0
 * @returns CredentialStatusDocument[]
 */
async function syncCredentialStatus({
  wallet,
  credentialIds,
  forceFetch,
}: SyncCredentialStatusParams & {
  wallet: IWallet;
}): Promise<CredentialStatusDocument[]> {
  let credentials;

  if (credentialIds && credentialIds.length) {
    credentials = await wallet.getDocumentsById(credentialIds);
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

    if (!statusDoc.status) {
      statusDoc.status = CredentialStatus.Pending;
      statusDoc.updatedAt = new Date().toISOString();
      await wallet.updateDocument(statusDoc);
    }

    if (!isApiConnected) {
      await blockchainService.ensureBlockchainReady();
      isApiConnected = true;
    }

    const result = await isValid({credential, wallet});
    statusDoc.status = result?.status;
    statusDoc.error = result?.error;
    statusDoc.warning = result?.warning;
    statusDoc.updatedAt = new Date().toISOString();

    await wallet.updateDocument(statusDoc);
  }

  return statusDocs;
}

/**
 * Removes a credential and its related documents from the wallet
 * @param param0 
 * @returns {Promise<void>}
 */
export async function removeCredential({
  wallet, 
  credential,
}: {
  wallet: IWallet;
  credential: Credential | string;
}): Promise<void> {
  // Allow passing either a credential object or a credential ID
  const credentialId = typeof credential === 'string' ? credential : credential.id;
  
  assert(!!credentialId, 'credential ID is required');
  
  // Remove the main credential document
  await wallet.removeDocument(credentialId);
  
  if (await wallet.getDocumentById(`${credentialId}#witness`)) {
    await wallet.removeDocument(`${credentialId}#witness`);
  }

  if (await wallet.getDocumentById(`${credentialId}#status`)) {
    await wallet.removeDocument(`${credentialId}#status`);
  }
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
    importCredentialFromURI: async (params: importCredentialFromUriParams) =>
      importCredentialFromURI({
        ...params,
        wallet,
      }),
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
      };
    },
    syncCredentialStatus: async (props: SyncCredentialStatusParams) => {
      return syncCredentialStatus({wallet, ...props});
    },
    addCredential: credential => addCredential({wallet, credential}),
    removeCredential: credential => removeCredential({wallet, credential}),
    // TODO: move import credential from json or URL to this provider
  };
}
