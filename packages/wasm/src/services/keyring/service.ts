// @ts-nocheck
import Keyring from '@polkadot/keyring';
import {cryptoWaitReady} from '@polkadot/util-crypto';
import {
  AddFromJsonParams,
  AddFromMnemonicParams,
  CreateFromUriParams,
  CreateFromPairParams,
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
    KeyringService.prototype.getKeyringPairJSON,
    KeyringService.prototype.initialize,
    KeyringService.prototype.signData,
    KeyringService.prototype.decryptKeyPair,
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

  decryptKeyPair({jsonData, password}: {keyPair: any, password: string}) {
    validation.addFromJson({jsonData, password});

    const pair = this.keyring.addFromJson(jsonData);

    pair.unlock(password);

    return pair;
  }

  addFromJson({jsonData, password}: AddFromJsonParams) {
    validation.addFromJson({jsonData, password});

    const pair = this.keyring.addFromJson(jsonData);

    pair.unlock(password);

    return pair.toJson();
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

  createFromPair(params: CreateFromPairParams): KeyringPair {
    validation.createFromPair(params);

    const {pair, meta, type} = params;

    return this.keyring.createFromPair(
      pair,
      meta,
      type,
    );
  }

  getKeyringPairJSON(params: CreateFromUriParams): KeyringPair {
    return this.getKeyringPair(params).toJson();
  }

  addressFromUri(params: CreateFromUriParams) {
    return this.getKeyringPair(params).address;
  }
}

export const keyringService: KeyringService = new KeyringService();
