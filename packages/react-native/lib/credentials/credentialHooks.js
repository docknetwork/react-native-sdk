import {useMemo, useCallback, useState, useEffect} from 'react';
import {useDocument, useWallet} from '../index';
import assert from 'assert';
import axios from 'axios';
import { getCredentialProvider } from '../wallet';

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
  const { documents, wallet } = useWallet();

  const credentials = useMemo(() => {
    if (Array.isArray(documents)) {
      return documents
        .filter(doc => {
          return (
            doc.type === 'VerifiableCredential' ||
            doc.type?.includes('VerifiableCredential')
          );
        })
        .sort(sortByIssuanceDate);
    }
    return [];
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
      return await wallet.remove(credentialId);
    },
    [wallet],
  );

  return useMemo(() => {
    return {
      credentials,
      doesCredentialExist,
      deleteCredential,
    };
  }, [credentials, doesCredentialExist, deleteCredential]);
}

export function useCredentialStatus({ credential }: any) {
  const [status, setStatus] = useState();
  const statusDoc = useDocument(`${credential.id}#status`);

  useEffect(() => {
    getCredentialProvider().getCredentialStatus(credential).then(setStatus);
  }, [credential, statusDoc]);

  return status;
}

export async function getIssuerEcosystems(issuer, credentialId ) {

  let apiUrl;

  if (credentialId && credentialId.indexOf('.dock.io')) {
    const origin = /^(https?:\/\/[^\/]+)/.exec(credentialId);
    if (origin && origin[0]) {
      apiUrl = origin[0].replace('creds-', 'api-');
    }
  }

  //TODO: Temporary implementation - Replace API fetch with sdk when sdk implementation
  const response = axios.get(`${apiUrl}/dids/${issuer}/ecosystems`)
  return (await response).data?.list
}

export function useEcosystems({ issuer, credentialId }) {
  const [ecosystems, setEcosystems] = useState([]);

  useEffect(() => {
    getIssuerEcosystems(issuer, credentialId).then(result => {
      setEcosystems(result || []);
    })
  }, [issuer, credentialId]);

  return { ecosystems };
}
