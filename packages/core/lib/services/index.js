import {keyringService} from './keyring/service';
import {dockService} from './dock/service';
import {substrateService} from './substrate/service';
import {walletService} from './wallet/service';
import {polkadotService} from './polkadot/service';
import {utilcryptoService} from './util-crypto/service';
import storage from './storage';
// import logger from './logger';

export default [
  keyringService,
  dockService,
  substrateService,
  walletService,
  polkadotService,
  utilcryptoService,
];
