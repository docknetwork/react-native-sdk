// @ts-nocheck
import {polkadotIcon} from '@polkadot/ui-shared/cjs/icons/index';
import {GetAddressSvgParams, validation} from './configs';

export class PolkadotService {
  rpcMethods = [PolkadotService.prototype.getAddressSvg];

  constructor() {
    this.name = 'polkadot';
  }

  async getAddressSvg(params: GetAddressSvgParams) {
    validation.getAddressSvg(params);

    return polkadotIcon(params.address, {
      isAlternative: params.isAlternative,
    });
  }
}

export const polkadotService: PolkadotService = new PolkadotService();
