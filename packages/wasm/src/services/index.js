import {keyringService} from './keyring/service';
import {dockService} from './dock/service';
import {substrateService} from './substrate/service';
import {walletService} from './wallet/service';
import {polkadotService} from './polkadot/service';
import {utilCryptoService} from './util-crypto/service';
import {storageService} from './storage/service';
import {didService} from './dids/service';
import {credentialService} from './credential/service';
import {relayService} from './relay-service/service';
import {pexService} from './pex/service';
import {trustRegistryService} from './trust-registry/service';
export default [
  keyringService,
  dockService,
  substrateService,
  walletService,
  polkadotService,
  utilCryptoService,
  storageService,
  didService,
  credentialService,
  relayService,
  pexService,
  trustRegistryService
];
