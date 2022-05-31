import assert from 'assert';
import {assertKeyType} from '../../core/validation';

export const validation = {
  addFromJson({jsonData, password}: AddFromJsonParams) {
    assert(typeof jsonData === 'object', 'invalid jsonData');
    assert(typeof password === 'string', 'invalid password');
  },
  initialize({ss58Format, type}: InitializeParams) {
    assert(typeof ss58Format === 'number', 'invalid ss58Format');

    if (type) {
      assertKeyType(type);
    }
  },
  addFromMnemonic({mnemonic, meta, type}: AddFromMnemonicParams) {
    assert(typeof mnemonic === 'string', 'invalid mnemonic');

    if (type) {
      assertKeyType(type);
    }

    if (meta) {
      assert(typeof meta === 'object', 'invalid meta');
    }
  },
  getKeyringPair(params: GetKeyringParams) {
    const {mnemonic, derivePath, meta, type} = params;

    assert(
      !params.keyPairType,
      'invalid parameter keyPairType, you should use type instead',
    );

    assert(typeof mnemonic === 'string', 'invalid mnemonic');

    if (derivePath) {
      assert(typeof derivePath === 'string', 'invalid mnemonic');
    }

    if (type) {
      assertKeyType(type);
    }

    if (meta) {
      assert(typeof meta === 'object', 'invalid meta');
    }
  },

  signData(params: SignDataParams) {
    assert(!!params.keyPair, 'invalid keypair');
    assert(!!params.data, 'invalid data');
  },
};

validation.addressFromUri = validation.getKeyringPair;

export const serviceName = 'keyring';

export type GetKeyringParams = {
  mnemonic: string,
  meta?: any,
  type?: string,
  derivePath?: string,
};

export type AddressFromUriParams = GetKeyringParams;

export type AddFromJsonParams = {
  jsonData: string,
  password: string,
};

export type InitializeParams = {
  ss58Format: number,
  type?: string,
};

export type AddFromMnemonicParams = {
  mnemonic: string,
  meta?: any,
  type: string,
};

export type SignDataParams = {
  keyPair: any,
  data: any,
};
