// @ts-nocheck
import assert from 'assert';

export const validation = {
  init(params) {
    assert(!!params.address, `invalid substrate address ${params.address}`);
  },
};

export type InitParams = {
  substrateAddress: string,
  cheqdApiUrl?: string,
  networkId?: string,
  cheqdMnemonic?: string,
};
