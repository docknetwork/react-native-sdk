// @ts-nocheck
import {serviceName} from './configs';
import {createHash} from 'crypto';
import {blockchainService} from '../blockchain/service';
import {validation} from './configs';


// TODO: Implement this function when the Trust Registry support is added to the SDK
function typedHexDID(resolver, issuerDID) {
  return issuerDID;
}

// Trust Registry Service is not supported in the current version of the SDK
class TrustRegistryService {
  constructor() {
    this.name = serviceName;
  }
  rpcMethods = [
    TrustRegistryService.prototype.getTrustRegistries,
    TrustRegistryService.prototype.getTrustRegistryVerifiers,
  ];
  
  async getTrustRegistries({
    schemaId,
    issuerDID,
    verifierDID,
  }: {
    schemaId?: string;
    issuerDID?: string;
    verifierDID?: string;
  }) {
    validation.getTrustRegistries({schemaId, issuerDID, verifierDID});
    const queryOptions = {};

    if (schemaId) {
      const hashedId = createHash('sha256').update(schemaId).digest('hex');
      const schemaIdHex = '0x' + hashedId;
      queryOptions.schemaIds = {
        AnyOf: [schemaIdHex],
      };
    }

    if (issuerDID) {
      const issuerDIDMethodKey = typedHexDID(blockchainService.dock.api, issuerDID);
      queryOptions.issuers = {
        AnyOf: [issuerDIDMethodKey],
      };
    }

    if (verifierDID) {
      const verifierDIDMethodKey = typedHexDID(
        blockchainService.dock.api,
        verifierDID,
      );
      queryOptions.verifiers = {
        AnyOf: [verifierDIDMethodKey],
      };
    }

    const registryInfo = await blockchainService.dock.trustRegistry?.registriesInfo(
      queryOptions,
    );

    return registryInfo;
  }

  async getTrustRegistryVerifiers({schemaId, trustRegistryId, issuerDID}) {
    validation.getTrustRegistryVerifiers({schemaId, trustRegistryId});

    const hashedId = createHash('sha256').update(schemaId).digest('hex');
    const schemaIdHex = '0x' + hashedId;

    const issuerDIDMethodKey = issuerDID
      ? typedHexDID(blockchainService.dock.api, issuerDID)
      : null;

    const metadata =
      await blockchainService.dock.trustRegistry.registrySchemasMetadata(
        {
          schemaIds: [schemaIdHex],
          ...(issuerDIDMethodKey && {
            issuers: {
              AnyOf: [issuerDIDMethodKey],
            },
          }),
        },
        trustRegistryId,
      );

    return metadata[schemaIdHex]?.verifiers;
  }
}

export const trustRegistryService = new TrustRegistryService();
