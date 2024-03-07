import {dockService} from '@docknetwork/wallet-sdk-wasm/src/services/dock';
import {trustRegistryService} from '@docknetwork/wallet-sdk-wasm/src/services/trust-registry';

export async function getEcosystems({
  issuerDID,
  verifierDID,
  schemaId,
}: {
  issuerDID?: string;
  verifierDID?: string;
  schemaId?: string;
}) {
  await dockService.ensureDockReady();

  try {
    return await trustRegistryService.getTrustRegistries({issuerDID, verifierDID, schemaId});
  } catch (error) {
    console.log('error', error);
    return [];
  }
}

export async function getVerifiers({trustRegistryId, issuerDID, schemaId}) {
  await dockService.ensureDockReady();

  try {
    const verifiers = await trustRegistryService.getTrustRegistryVerifiers({
      schemaId,
      issuerDID: issuerDID,
      trustRegistryId,
    });
    return verifiers;
  } catch (error) {
    console.log('error', error);
    return [];
  }
}
