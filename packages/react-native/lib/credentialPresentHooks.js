import {useCallback, useMemo} from 'react';
import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm-services/lib/services/credential';

export function usePresentation() {
  const presentCredentials = useCallback(
    async ({credentials, keyDoc, challenge, id, domain}) => {
      return credentialServiceRPC.createPresentation({
        credentials,
        keyDoc,
        challenge,
        id,
        domain,
      });
    },
    [],
  );

  return useMemo(() => ({presentCredentials}), [presentCredentials]);
}
