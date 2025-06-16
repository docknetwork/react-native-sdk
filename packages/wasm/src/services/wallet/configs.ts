// @ts-nocheck
import assert from 'assert';
import {assertPassword} from '../../core/validation';

export const validation = {
  getDocumentsFromEncryptedWallet({
    encryptedJSONWallet,
    password,
  }: GetDocumentsFromEncryptedWallet) {
    assert(
      typeof encryptedJSONWallet === 'object',
      `invalid json data: ${encryptedJSONWallet}`,
    );
    assertPassword(password);
  },
  exportDocuments({documents, password}: ExportDocuments) {
    assert(Array.isArray(documents), 'Invalid Documents');
    assert(documents.length > 0, 'Cannot export empty documents');
    for (const document of documents) {
      assert(typeof document.id === 'string', 'Document ID is required');
      assert(
        typeof document['@context'] !== 'undefined',
        '@context is required',
      );
    }

    assertPassword(password);
  },
};

export const serviceName = 'wallet';

export type GetDocumentsFromEncryptedWallet = {
  encryptedJSONWallet: any,
  password: string,
};

export type ExportDocuments = {
  documents: Array<any>,
};
