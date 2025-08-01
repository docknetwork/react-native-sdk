import {useMemo, useCallback, useState, useEffect} from 'react';
import {useDocument, useDocuments} from '../index';
import assert from 'assert';
import {getCredentialProvider, getWallet} from '../wallet';

export const sortByIssuanceDate = (a, b) =>
  getCredentialTimestamp(b) - getCredentialTimestamp(a);

export function getCredentialTimestamp(credential) {
  assert(!!credential, 'credential is required');

  if (!credential.issuanceDate) {
    return 0;
  }

  return new Date(credential.issuanceDate).getTime() || 0;
}

export function waitFor(condition, timeout) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      if (await Promise.resolve(condition())) {
        clearInterval(interval);
        resolve(true);
      }
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Timed out'));
    }, timeout);
  });
}

export function useCredentialUtils() {
  const {documents, loading} = useDocuments({
    type: 'VerifiableCredential',
  });

  const credentials = useMemo(() => {
    return documents
      .filter(doc => !!doc.id)
      .sort(sortByIssuanceDate);
  }, [documents]);

  const doesCredentialExist = useCallback((allCredentials, credentialToAdd) => {
    return !!allCredentials.find(item => item.id === credentialToAdd.id);
  }, []);

  const deleteCredential = useCallback(
    async credentialId => {
      assert(
        typeof credentialId === 'string' && credentialId.length > 0,
        'Credential ID is not set',
      );
      return await getWallet().remove(credentialId);
    },
    [],
  );

  return useMemo(() => {
    return {
      credentials,
      doesCredentialExist,
      deleteCredential,
      loading,
    };
  }, [credentials, doesCredentialExist, deleteCredential, loading]);
}

export function useCredentialStatus({credentialId, onError}: any) {
  console.warn(
    'useCredentialStatus from credentialHooks is deprecated. Please use useCredentialStatus from CredentialContext instead.'
  );
  
  const [status, setStatus] = useState();
  const statusDoc = useDocument(`${credentialId}#status`);

  useEffect(() => {
    const fetchStatus = async () => {
      const provider = getCredentialProvider();
      const credential = await provider.getById(credentialId);

      getCredentialProvider()
        .getCredentialStatus(credential)
        .then(setStatus)
        .catch(onError);
    };

    fetchStatus();
  }, [credentialId, statusDoc, onError]);

  return useMemo(() => {
    return status;
  }, [status]);
}

