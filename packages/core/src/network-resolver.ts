import {
  DataStore,
  DocumentNetworkResolver,
  DocumentResolverProps,
  DocumentResolverResult,
} from '@docknetwork/wallet-sdk-data-store/src/types';

type ResolverResult = string | null;

export const dockDocumentNetworkResolver: DocumentNetworkResolver = async ({
  document,
  dataStore,
}: DocumentResolverProps): Promise<DocumentResolverResult> => {
  let networkId;
  let isFallback = false;
  let currentResolver;
  for (const resolver of resolvers) {
    networkId = await resolver({document, dataStore});
    currentResolver = resolver;
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
    resolver: currentResolver,
  };
};

/**
 *
 * Given an Api URL, resolve the network ID
 * For now it will be applied for creds and certs
 * It can be extended to resolve other external URLs
 *
 */
export function resolveApiNetwork({
  url,
  dataStore,
}: {
  url: string;
  dataStore: DataStore;
}) {
  for (const network of dataStore.networks) {
    for (const hostname of network.credentialHostnames) {
      if (hostname instanceof RegExp) {
        if (hostname.test(url)) {
          return network.id;
        }
      } else {
        if (url.indexOf(hostname) > -1) {
          return network.id;
        }
      }
    }
  }

  return null;
}

export async function credentialResolver({
  document,
  dataStore,
}: DocumentResolverProps): Promise<ResolverResult> {
  if (!document) {
    return null;
  }

  if (!document.type?.includes('VerifiableCredential')) {
    return null;
  }

  // TODO: create fallback with DID resolution

  return resolveApiNetwork({
    url: document.id,
    dataStore,
  });
}

export async function proofRequestResolver({
  document,
  dataStore,
}: DocumentResolverProps): Promise<ResolverResult> {
  if (!document) {
    return null;
  }

  const isProofRequest =
    document.type === 'proof-request' && document.qr;

  if (!isProofRequest) {
    return null;
  }

  return resolveApiNetwork({
    url: document.qr,
    dataStore,
  });
}

export async function didResolver({
  document,
  dataStore,
}: DocumentResolverProps): Promise<ResolverResult> {
  // TODO: Define DID resolver
  return null;
}

const resolvers = [
  credentialResolver,
  didResolver,
  proofRequestResolver,
];
