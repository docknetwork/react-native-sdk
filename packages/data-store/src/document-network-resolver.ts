import {
  DataStore,
  DocumentNetworkResolver,
  DocumentResolverProps,
  DocumentResolverResult,
  WalletDocument,
} from './types';

type ResolverResult = string | null;

export const genericDocumentNetworkResolver: DocumentNetworkResolver = async ({
  document,
  dataStore,
}: DocumentResolverProps): Promise<DocumentResolverResult> => {
  return {
    networkId: dataStore.networkId,
    isFallback: true,
  };
};
