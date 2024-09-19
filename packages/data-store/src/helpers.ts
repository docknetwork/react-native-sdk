import {DataStore, DataStoreConfigs} from './types';

export function documentHasType(document: any, type: string) {
  if (Array.isArray(document.type)) {
    return document.type.includes(type);
  }

  return document.type === type;
}

export async function importUniversalWalletDocuments({documents, dataStore}: {
  documents: any[];
  dataStore: DataStore;
}) {
  for (const _document of documents) {
    let document = _document;
    if (documentHasType(document, 'VerifiableCredential') && document.value) {
      document = document.value;
    }

    try {
      await dataStore.documents.addDocument(document);
    } catch (err) {
      console.error(err);
    }
  }
}