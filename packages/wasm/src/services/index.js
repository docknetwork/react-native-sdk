import {keyringService} from './keyring/service';
import {blockchainService} from './blockchain/service';
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
import {edvService} from './edv/service';

export default [
  keyringService,
  blockchainService,
  substrateService,
  walletService,
  polkadotService,
  utilCryptoService,
  storageService,
  didService,
  credentialService,
  relayService,
  pexService,
  trustRegistryService,
  edvService,
];
