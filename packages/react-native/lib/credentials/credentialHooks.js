import {useMemo, useCallback} from 'react';
import {useWallet} from '../index';
import assert from 'assert';

const validateCredential = credential => {
  assert(typeof credential !== 'undefined', 'Invalid Credential');
  assert(typeof credential?.id === 'string', 'Credential has no ID');
  assert(
    credential.hasOwnProperty('@context') === true,
    'Credential has no context',
  );
  assert(
    credential.type?.includes('VerifiableCredential'),
    'Credential has an invalid type',
  );
};
export const sortByIssuanceDate = (a, b) =>
  getCredentialTimestamp(b.content) - getCredentialTimestamp(a.content);

export function getCredentialTimestamp(credential) {
  assert(!!credential, 'credential is required');

  if (!credential.issuanceDate) {
    return 0;
  }

  return new Date(credential.issuanceDate).getTime() || 0;
}
export function useCredentialUtils() {
  const {documents, wallet} = useWallet({syncDocs: true});

  const credentials = useMemo(() => {
    if (Array.isArray(documents)) {
      return documents
        .filter(doc => {
          return (
            doc.type === 'VerifiableCredential' ||
            doc.type?.includes('VerifiableCredential')
          );
        })
        .map(document => ({
          content: document.value,
          id: document.id,
        }))
        .sort(sortByIssuanceDate);
    }
    return [];
  }, [documents]);

  const doesCredentialExist = useCallback((allCredentials, credentialToAdd) => {
    return !!allCredentials.find(
      item => item.content.id === credentialToAdd.id,
    );
  }, []);

  const saveCredential = useCallback(
    async jsonData => {
      validateCredential(jsonData);
      if (doesCredentialExist(credentials, jsonData)) {
        throw new Error('This credential already exists in the wallet');
      }
      await wallet.add({
        value: jsonData,
        type: 'VerifiableCredential',
      });
    },
    [credentials, doesCredentialExist, wallet],
  );
  const deleteCredential = useCallback(
    async credentialId => {
      assert(
        typeof credentialId === 'string' && credentialId.length > 0,
        'Credential ID is not set',
      );
      return await wallet.remove(credentialId);
    },
    [wallet],
  );

  return useMemo(() => {
    return {
      credentials,
      doesCredentialExist,
      saveCredential,
      deleteCredential,
    };
  }, [credentials, doesCredentialExist, saveCredential, deleteCredential]);
}
