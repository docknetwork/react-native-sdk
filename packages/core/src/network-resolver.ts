import {
  DataStore,
  DocumentNetworkResolver,
  DocumentResolverProps,
  DocumentResolverResult,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';

type ResolverResult = string | null;

export const dockDocumentNetworkResolver: DocumentNetworkResolver = async ({
  document,
  dataStore,
}: DocumentResolverProps): Promise<DocumentResolverResult> => {
  let networkId;
  let isFallback = false;

  for (const resolver of resolvers) {
    networkId = await resolver({document, dataStore});

    if (networkId) {
      break;
    }
  }

  if (!networkId) {
    isFallback = true;
    networkId = dataStore.networkId;
  }

  return {
    networkId: networkId,
    isFallback,
  };
};

export async function credentialResolver({
  document,
  dataStore,
}: DocumentResolverProps): Promise<ResolverResult> {
  if (!document) {
    return null;
  }

  if (!document.type.includes('VerifiableCredential')) {
    return null;
  }

  for (const network of dataStore.networks) {
    for (const hostname of network.credentialHostnames) {
      if (document.id.indexOf(hostname) > -1) {
        return network.id;
      }
    }
  }

  // TODO: create fallback for DID resolution

  return null;
}

async function didResolver({
  document,
  dataStore,
}: DocumentResolverProps): Promise<ResolverResult> {
  // TODO: Define DID resolver
  return null;
}

async function accountResolver({
  document,
  dataStore,
}: DocumentResolverProps): Promise<ResolverResult> {
  // TODO: Define account resolver
  return null;
}

const resolvers = [credentialResolver, accountResolver, didResolver];
