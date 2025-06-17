import assert from 'assert';
import axios from 'axios';
import {utilCryptoService} from '@docknetwork/wallet-sdk-wasm/src/services/util-crypto';

// TODO: FIXME: this wont work for other staging envs
function getApiURL(networkId) {
  return networkId === 'mainnet' ? 'https://api.truvera.io' : 'https://api-testnet.truvera.io';
}

export async function getEcosystems({
  issuerDID,
  verifierDID,
  schemaId,
  networkId,
}: {
  networkId: string;
  issuerDID?: string;
  verifierDID?: string;
  schemaId?: string;
}) {
  assert(!!networkId, 'networkId is required');
  
  try {
    // TODO: Use the SDK to fetch ecosystems when it's available
    const {data} = await axios.post(`${getApiURL(networkId)}/trust-registries/query`,{
      issuerDID,
      verifierDID,
      schemaId,
    })

    const registries = {}

    data.forEach((registry) => {
      registries[registry.id] = registry;
    });

    return registries;
  } catch (error) {
    console.log('error', error);
    return [];
  }
}

export async function getVerifiers({trustRegistryId, issuerDID, schemaId, networkId}: {
  trustRegistryId: string;
  issuerDID?: string;
  schemaId?: string;
  networkId: string;
}) {
  assert(!!networkId, 'networkId is required');
  assert(!!trustRegistryId, 'trustRegistryId is required');

  try {
    // TODO: Use the SDK to fetch verifiers when it's available
    const { data } = await axios.get(`${getApiURL(networkId)}/trust-registries/${trustRegistryId}/verifiers?schemaId=${encodeURIComponent(schemaId)}&issuerDID=${issuerDID}`);
    return data;
  } catch (error) {
    console.log('error', error);
    return [];
  }
}

export async function getMetadata(govFramework: string): Promise<any> {
  try {
    const metadataURL = await utilCryptoService.hexToString(govFramework);
    const response = await axios.get(metadataURL);
    return response.data;
  } catch (e) {
    console.log('error: ', e);
  }

  return {};
}

export async function formatEcosystemData(ecosystems: any): Promise<any[]> {
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
}
