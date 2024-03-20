import {useEffect, useState} from 'react';
import {getEcosystems} from '@docknetwork/wallet-sdk-core/src/ecosystem-tools';
import {hexToString} from '@polkadot/util';
import axios from 'axios';
import { captureException } from '@docknetwork/wallet-sdk-core/src/helpers';

const getMetadata = async govFramework => {
  const metadataURL = await hexToString(govFramework);
  try {
    const response = await axios.get(metadataURL);
    return response.data;
  } catch (e) {
    console.log('error: ', e)
  }

  return {};
};

const formatEcosystemData = async ecosystems => {
  const formattedEcosystems = [];
  const ecosystemsList = Object.entries(ecosystems);

  for (let i = 0; i < ecosystemsList.length; i++) {
    let ecosystemData = {};
    ecosystemData.trustRegistryId = ecosystemsList[i][0];
    ecosystemData = {...ecosystemData, ...ecosystemsList[i][1]};

    const metadata = await getMetadata(ecosystemsList[i][1]?.govFramework);
    formattedEcosystems.push({...ecosystemData, ...metadata});
  }

  return formattedEcosystems;
};

export function useEcosystems({issuer, schemaId}) {
  const [ecosystems, setEcosystems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    getEcosystems({issuerDID: issuer, schemaId: schemaId})
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
