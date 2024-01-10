import {useMemo, useCallback, useState, useEffect} from 'react';
import {useWallet} from '../index';
import assert from 'assert';
import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';
import {dockService} from '@docknetwork/wallet-sdk-wasm/src/services/dock';
import axios from 'axios';

export const CREDENTIAL_STATUS = {
  INVALID: 'invalid',
  EXPIRED: 'expired',
  VERIFIED: 'verified',
  REVOKED: 'revoked',
  PENDING: 'pending',
};

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

async function getCredentialValidityStatus(credential) {
  try {
    await waitFor(() => dockService.isApiConnected(), 90000);
    const result = await credentialServiceRPC.verifyCredential({ credential });
    return result;
  } catch (error) {
    return {
      verified: false,
      error,
    };
  }
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

  const saveCredential = useCallback(
    async jsonData => {
      validateCredential(jsonData);
      if (doesCredentialExist(credentials, jsonData)) {
        throw new Error('This credential already exists in the wallet');
      }
      await wallet.addDocument(jsonData);
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
export function isInThePast(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export async function getCredentialStatus(credential) {
  assert(typeof credential !== 'undefined', 'Invalid Credential');

  if (isCredentialExpired(credential)) {
    return buildStatusResponse(CREDENTIAL_STATUS.EXPIRED);
  }

  const { verified, error } = await getCredentialValidityStatus(credential);

  if (isCredentialRevoked(error)) {
    return buildStatusResponse(CREDENTIAL_STATUS.REVOKED, error);
  }

  if (verified) {
    return buildStatusResponse(CREDENTIAL_STATUS.VERIFIED);
  }

  if(error?.name === "VerificationError") {
    return buildStatusResponse(CREDENTIAL_STATUS.INVALID, error);
  }

  return buildStatusResponse(CREDENTIAL_STATUS.PENDING, error);
}

function isCredentialExpired(credential) {
  return credential.expirationDate
    ? isInThePast(new Date(credential.expirationDate))
    : false;
}

function isCredentialRevoked(error) {
  return (
    typeof error === 'string' && error.toLowerCase().includes('revocation')
  );
}

function buildStatusResponse(status, error = null) {
  return {
    status,
    error,
  };
}

export let cachedCredentialStatus = {};

export function useGetCredentialStatus({ credential }) {
  const [status, setStatus] = useState(
    cachedCredentialStatus[credential.id] ||
    buildStatusResponse(CREDENTIAL_STATUS.PENDING),
  );

  useEffect(() => {
    getCredentialStatus(credential).then(response => {
      cachedCredentialStatus[credential.id] = response;
      setStatus(response);
    });
  }, [credential]);

  return useMemo(() => {
    return status;
  }, [status]);
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
