// @ts-nocheck
import assert from 'assert';

export const validation = {
  initialize(params: InitializeEDVParams) {
    assert(!!params, 'params required');
    assert(!!params.agreementKey, 'agreementKey required');
    assert(!!params.hmacKey, 'hmac required');
    assert(!!params.verificationKey, 'verificationKey required');
    assert(!!params.envUrl, 'envUrl required');
    assert(!!params.authKey, 'authKey required');
  },
};

export const serviceName = 'edv';

export type InitializeEDVParams = {
  agreementKey: any,
  hmacKey: any,
  verificationKey: any,
  edvUrl: string,
  authKey: string,
};
