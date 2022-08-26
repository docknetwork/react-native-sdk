import {useCallback, useMemo} from 'react';
import {credentialServiceRPC} from '@docknetwork/wallet-sdk-core/lib/services/credential';

export function usePresentation() {
  const presentCredentials = useCallback(async (credentials, keyDoc) => {
    return credentialServiceRPC.createPresentation({
      credentials,
      keyDoc,
    });
  }, []);

  return useMemo(() => ({presentCredentials}), [presentCredentials]);
}
