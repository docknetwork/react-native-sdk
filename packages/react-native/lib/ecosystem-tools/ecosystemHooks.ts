import {useEffect, useState} from 'react';
import {getEcosystems} from '@docknetwork/wallet-sdk-core/src/ecosystem-tools';
// @ts-ignore
import {hexToU8a, u8aToString} from '@docknetwork/credential-sdk/utils';
import axios from 'axios';
import { captureException } from '@docknetwork/wallet-sdk-core/src/helpers';
import { getWallet } from '../wallet';

const hexToString = (hex: string): string => {
  try {
    const bytes = hexToU8a(hex);
    return u8aToString(bytes);
  } catch (e) {
    console.log('error: ', e)
  }

  return '';
};

const getMetadata = async govFramework => {
  
  try {
    const metadataURL = await hexToString(govFramework);
    const response = await axios.get(metadataURL);
    return response.data;
  } catch (e) {
    console.log('error: ', e)
  }

  return {};
};

const formatEcosystemData = async ecosystems => {
  const formattedEcosystems = [];
  const ecosystemsList: any = Object.entries(ecosystems);

  for (let i = 0; i < ecosystemsList.length; i++) {
    let ecosystemData: any = {};
    ecosystemData.trustRegistryId = ecosystemsList[i][0];
    ecosystemData = {...ecosystemData, ...ecosystemsList[i][1]};

    const metadata = await getMetadata(ecosystemsList[i][1]?.govFramework);
    formattedEcosystems.push({...ecosystemData, ...metadata});
  }

  return formattedEcosystems;
};

export function useEcosystems({issuer, verifier, schemaId}) {
  const [ecosystems, setEcosystems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if(isLoading) return;
    setIsLoading(true);
    setIsError(false);
    getEcosystems({issuerDID: issuer, verifierDID: verifier, schemaId: schemaId, networkId: getWallet().getNetworkId()})
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
