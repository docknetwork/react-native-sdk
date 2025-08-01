import {useEffect, useState} from 'react';
import {
  getEcosystems,
  formatEcosystemData,
} from '@docknetwork/wallet-sdk-core/src/ecosystem-tools';
import { captureException } from '@docknetwork/wallet-sdk-core/src/helpers';

export function useEcosystems({issuer, verifier, schemaId, networkId}: {
  issuer?: string;
  verifier?: string;
  schemaId?: string;
  networkId: string;
}) {
  const [ecosystems, setEcosystems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if(isLoading) return;
    setIsLoading(true);
    setIsError(false);
    getEcosystems({issuerDID: issuer, verifierDID: verifier, schemaId: schemaId, networkId })
      .then(async result => {
        try {
          const ecosystemData = await formatEcosystemData(result);
          setEcosystems(ecosystemData);
        } catch (e) {
          captureException(e);
          setIsError(true)
          console.log('Error formatting ecosystem data', e);
        }
      })
      .catch(e => {
        console.log('error fetching ecosystem', e);
        captureException(e);
        setIsError(true)
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [issuer, schemaId]);

  return {ecosystems, isLoading, isError};
}
