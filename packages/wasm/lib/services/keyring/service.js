import Keyring from '@polkadot/keyring';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {
  AddFromJsonParams,
  AddFromMnemonicParams,
  CreateFromUriParams,
  InitializeParams,
  serviceName,
  validation,
  SignDataParams,
} from './configs';

export function getKeyring() {
  return keyringService.keyring;
}

export class KeyringService {
  keyring: Keyring;

  rpcMethods = [
    KeyringService.prototype.addFromJson,
    KeyringService.prototype.addFromMnemonic,
    KeyringService.prototype.addressFromUri,
    KeyringService.prototype.getKeyringPair,
    KeyringService.prototype.initialize,
    KeyringService.prototype.signData,
  ];

  constructor() {
    this.name = serviceName;
  }

  async initialize(params: InitializeParams) {
    await cryptoWaitReady();

    validation.initialize(params);

    this.keyring = new Keyring(params);

    return true;
  }

  addFromMnemonic({mnemonic, meta, type}: AddFromMnemonicParams) {
    validation.addFromMnemonic({mnemonic, meta, type});
    return this.keyring.addFromMnemonic(mnemonic, meta, type);
  }

  addFromJson({jsonData, password}: AddFromJsonParams) {
    validation.addFromJson({jsonData, password});

    const pair = this.keyring.addFromJson(jsonData);

    pair.unlock(password);
    return pair;
  }

  signData(params: SignDataParams): any {
    validation.signData(params);
    const account = this.keyring.addFromPair(params.keyPair);
    return account.sign(params.data);
  }

  getKeyringPair(params: CreateFromUriParams): KeyringPair {
    validation.getKeyringPair(params);

    const {mnemonic, meta, type, derivePath = ''} = params;

    return this.keyring.createFromUri(
      `${mnemonic.trim()}${derivePath}`,
      meta,
      type,
    );
  }

  addressFromUri(params: CreateFromUriParams) {
    return this.getKeyringPair(params).address;
  }
}

export const keyringService: KeyringService = new KeyringService();
