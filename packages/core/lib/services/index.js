import {keyringService} from './keyring/service';
import {dockService} from './dock/service';
import {substrateService} from './substrate/service';
import {walletService} from './wallet/service';
import utilCryptoMethods from './util-crypto';
// import storage from './storage';
// import logger from './logger';
// import polkadotUI from './polkadot-ui';

export default [
  keyringService,
  dockService,
  substrateService,
  walletService,
  // api,
  // utilCryptoMethods,
  // storage,
  // logger,
  // polkadotUI,
];
