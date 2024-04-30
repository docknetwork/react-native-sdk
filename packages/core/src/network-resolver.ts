import {
  DataStore,
  DocumentNetworkResolver,
  DocumentResolverProps,
  DocumentResolverResult,
  WalletDocument,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {utilCryptoService} from '@docknetwork/wallet-sdk-wasm/src/services/util-crypto';

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

  if (document.type !== 'proof-request') {
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

export async function accountResolver({
  document,
  dataStore,
}: DocumentResolverProps): Promise<ResolverResult> {
  if (!document) {
    return null;
  }

  const isAddress = Array.isArray(document.type)
    ? document.type.includes('Address')
    : document.type === 'Address';

  if (!isAddress) {
    return null;
  }

  const addressPrefixList = dataStore.networks.map(
    network => network?.configs?.addressPrefix,
  );

  const addressPrefix = await utilCryptoService.getAddressPrefix({
    address: document.id,
    startPrefix: Math.min(...addressPrefixList),
    endPrefix: Math.max(...addressPrefixList),
  });

  const network = dataStore.networks.find(
    item => item.configs?.addressPrefix === addressPrefix,
  );

  return network?.id;
}

const resolvers = [
  credentialResolver,
  accountResolver,
  didResolver,
  proofRequestResolver,
];
