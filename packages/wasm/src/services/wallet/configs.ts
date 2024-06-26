// @ts-nocheck
import assert from 'assert';
import {
  assertAddress,
  assertKeyType,
  assertPassword,
} from '../../core/validation';
import {KeypairType} from '../../types';

function assertContent(content: WalletContent) {
  assert(typeof content === 'object', 'invalid wallet content');
  assert(typeof content.id === 'string', `invalid content id ${content.id}`);
  assert(
    typeof content.type === 'string',
    `invalid content type ${content.type}`,
  );
}

export const validation = {
  getDocumentById(id: string) {
    assert(typeof id === 'string', 'invalid documentId');
    assert(!!id, 'documentId is required');
  },
  resolveCorrelations(address) {
    assert(typeof address === 'string', 'invalid documentId');
    assert(!!address, 'documentId is required');
  },
  exportAccount({address, password}: ExportAccountParams) {
    assertAddress(address);
    assertPassword(password);
  },
  create({walletId}: CreateParams): Promise<any> {
    assert(typeof walletId === 'string', `invalid walletId ${walletId}`);
  },
  lock(password: string) {
    assertPassword(password);
  },
  unlock(password: string) {
    assertPassword(password);
  },
  add(params: AddParams) {
    assertContent(params);
  },
  remove(id: string) {
    assert(typeof id === 'string', 'invalid documentId');
    assert(!!id, 'documentId is required');
  },
  update(params: UpdateParams) {
    assertContent(params);
  },
  query(params: QueryParams) {
    assert(typeof params === 'object', 'invalid query');
  },
  exportWallet(password: string) {
    assertPassword(password);
  },
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
  importWallet({json, password}: ImportWalletParams) {
    assert(typeof json === 'object', `invalid json data: ${json}`);
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
  createAccountDocuments(params: CreateAccountDocumentsParams) {
    const {name, json, password, mnemonic, type} = params;

    // Property derivationPath was replaced by derivePath
    assert(
      !params.derivationPath,
      'invalid parameter derivationPath, it should be derivePath instead',
    );

    assert(typeof name === 'string', `invalid account name: ${name}`);

    if (json) {
      assert(typeof json === 'object', `invalid json: ${password}`);
      assert(typeof password === 'string', `invalid password: ${password}`);
    } else {
      assert(typeof mnemonic === 'string', `invalid mnemonic: ${mnemonic}`);
    }

    if (type) {
      assertKeyType(type);
    }
  },
};

export const serviceName = 'wallet';

export type WalletContent = {
  '@context'?: string[],
  name?: any,
  id: any,
  type: DocumentType,
  value?: any,
  correlation?: any[],
};

export type CreateAccountDocumentsParams = {
  name: string,
  json?: string,
  password?: string,
  mnemonic?: string,
  type?: KeypairType,
  derivePath?: string,
};

export type GetDocumentsFromEncryptedWallet = {
  encryptedJSONWallet: any,
  password: string,
};

export type ExportDocuments = {
  documents: Array<any>,
};

export type QueryParams = any;
export type AddParams = WalletContenxt;
export type UpdateParams = WalletContent;
export type RemoveParams = string;
export type ImportWalletParams = {
  json: string,
  password: string,
};
export type ExportAccountParams = {
  address: string,
  password: string,
};
export type CreateParams = {
  walletId: string,
  type: string,
};
