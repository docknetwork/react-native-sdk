import {ContextProps, WalletDocument} from '@docknetwork/wallet-sdk-data-store/src/types';
import assert from 'assert';
import {DocumentEntity} from './document.entity';



/**
 * Convert document entity to wallet document
 * @param entity
 */
export function toWalletDocument(entity: DocumentEntity): WalletDocument {
  if (!entity?.data) {
    return entity;
  }

  const result: any = entity.data;

  if (!result.id) {
    result.id = entity.id;
  }

  return result;
}

/**
 * Convert wallet document to document entity
 * @param walletDocument
 */
export async function toDocumentEntity({
  dataStore,
  document,
}: ContextProps & {
  document: any;
}): Promise<DocumentEntity> {
  const type = document.type || [];

  return {
    id: document.id,
    type: type,
    data: document,
    correlation: document.correlation || [],
    networkId: dataStore.networkId,
  } as DocumentEntity;
}

export const saveOptions = {
  // Android is having issues when running multiple document saves in a short period of time
  // We will disable transactions for now until we find a better solution
  transaction: false,
};
