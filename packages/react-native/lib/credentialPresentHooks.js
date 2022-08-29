import {useCallback, useMemo} from 'react';
import {credentialServiceRPC} from '@docknetwork/wallet-sdk-core/lib/services/credential';

export function usePresentation() {
  const presentCredentials = useCallback(
    async ({credentials, keyDoc, challenge, id}) => {
      return credentialServiceRPC.createPresentation({
        credentials,
        keyDoc,
        challenge,
        id,
      });
    },
    [],
  );

  return useMemo(() => ({presentCredentials}), [presentCredentials]);
}
