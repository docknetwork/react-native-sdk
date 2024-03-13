// @ts-nocheck
import {serviceName} from './configs';
import {typedHexDID} from '@docknetwork/sdk/utils/did/typed-did/helpers';
import {createHash} from 'crypto';
import {dockService} from '../dock/service';
import {validation} from './configs';

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
      const issuerDIDMethodKey = typedHexDID(dockService.dock.api, issuerDID);
      queryOptions.issuers = {
        AnyOf: [issuerDIDMethodKey],
      };
    }

    if (verifierDID) {
      const verifierDIDMethodKey = typedHexDID(
        dockService.dock.api,
        verifierDID,
      );
      queryOptions.verifiers = {
        AnyOf: [verifierDIDMethodKey],
      };
    }

    const registryInfo = await dockService.dock.trustRegistry?.registriesInfo(
      queryOptions,
    );

    return registryInfo;
  }

  async getTrustRegistryVerifiers({schemaId, trustRegistryId, issuerDID}) {
    validation.getTrustRegistryVerifiers({schemaId, trustRegistryId});

    const hashedId = createHash('sha256').update(schemaId).digest('hex');
    const schemaIdHex = '0x' + hashedId;

    const issuerDIDMethodKey = issuerDID
      ? typedHexDID(dockService.dock.api, issuerDID)
      : null;

    const metadata =
      await dockService.dock.trustRegistry.registrySchemasMetadata(
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
