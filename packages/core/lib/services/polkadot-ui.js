import {polkadotIcon} from '@polkadot/ui-shared';

export default {
  name: 'polkadotUI',
  routes: {
    async getPolkadotSvgIcon(address, isAlternative) {
      return polkadotIcon(address, {
        isAlternative,
      });
    },
  },
};
