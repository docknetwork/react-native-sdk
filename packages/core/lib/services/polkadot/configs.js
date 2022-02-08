import {assertAddress} from '../../core/validation';

export const validation = {
  getAddressSvg({address, isAlternative}: GetAddressSvgParams) {
    assertAddress(address);
  },
};

export type GetAddressSvgParams = {
  address: string,
  isAlternative?: boolean,
};
