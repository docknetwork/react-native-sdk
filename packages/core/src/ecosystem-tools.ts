import {dockService} from '@docknetwork/wallet-sdk-wasm/src/services/dock';
import {trustRegistryService} from '@docknetwork/wallet-sdk-wasm/src/services/trust-registry';
import assert from 'assert';
import axios from 'axios';


function getApiURL(networkId) {
  return networkId === 'mainnet' ? 'https://api.dock.io' : 'https://api-testnet.dock.io';
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
