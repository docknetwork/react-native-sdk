import {ContextProps, WalletDocument} from '../../types';
import {getSaveOptions, saveOptions, toDocumentEntity} from './helpers';
import {DocumentEntity} from './document.entity';

/**
 * Update document
 * @param dataStore
 * @param document
 */
export async function updateDocument({
  dataStore,
  document,
}: ContextProps & {document: WalletDocument}): Promise<WalletDocument> {
  const repository = dataStore.db.getRepository(DocumentEntity);
  const entity = await toDocumentEntity({
    dataStore,
    document,
  });
  await repository.save(entity, saveOptions);

  return document;
}
