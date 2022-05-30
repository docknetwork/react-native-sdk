import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids';
import {serviceName} from './config';
import {polkadotToKeydoc} from '@docknetwork/wallet/polkadot-utils';
import {keyringService} from '../keyring/service';
import {utilCryptoService} from '../util-crypto/service';

class DIDService {
  constructor() {
    this.name = serviceName;
  }
  rpcMethods = [
    DIDService.prototype.keypairToDidKeyDocument,
    DIDService.prototype.getDidResolution,
    DIDService.prototype.generateKeyDoc,
  ];
  keypairToDidKeyDocument({keypairDoc}) {
    return DIDKeyManager.keypairToDidKeyDocument(keypairDoc);
  }
  getDidResolution({didDocument}) {
    return DIDKeyManager.getDidResolution(didDocument);
  }
  async generateKeyDoc({}) {
    const mnemonic = await utilCryptoService.mnemonicGenerate(12);

    const keyring = keyringService.getKeyringPair({
      mnemonic,
      derivePath: '',
      type: 'ed25519',
    });

    return polkadotToKeydoc(keyring);
  }
}

export const didService = new DIDService();
