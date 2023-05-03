import {
  DataStore,
  DocumentNetworkResolver,
  DocumentResolverProps,
  DocumentResolverResult,
  WalletDocument,
} from './types';

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

async function credentialResolver({
  document,
}: DocumentResolverProps): Promise<ResolverResult> {
  if (!document.type.includes('VerifiableCredential')) {
    return null;
  }

  if (document.id.indexOf('creds-testnet.dock.io') > -1) {
    return 'testnet';
  }

  if (document.id.indexOf('creds.dock.io') > -1) {
    return 'mainnet';
  }

  return null;
}

async function didResolver({
  document,
  dataStore,
}: DocumentResolverProps): Promise<ResolverResult> {
  return null;
}

async function accountResolver({
  document,
  dataStore,
}: DocumentResolverProps): Promise<ResolverResult> {
  return null;
}

const resolvers = [credentialResolver, accountResolver, didResolver];
