// @ts-nocheck
import assert from 'assert';

export const serviceName = 'trust-registry';
export const validation = {
  getTrustRegistries: params => {
    const {schemaId, issuerDID, verifierDID} = params;
    assert(!!schemaId || !!issuerDID || !!verifierDID, 'no query option provider');
  },
  getTrustRegistryVerifiers: params => {
    const {trustRegistryId} = params;
    assert(!!trustRegistryId, 'trustRegistryId is required');
  },
};
