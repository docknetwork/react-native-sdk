import assert from 'assert';
import { assertAddress } from '../../core/validation';

export const validation = {
  deriveValidate(uri: string) {
    assert(!!uri, 'uri is required');
  },

  isAddressValid(address: string) {
    assertAddress(address);
  },
  
  mnemonicGenerate(numWords: number) {
    if (numWords) {
      assert(typeof numWords === 'number', 'invalid number of words');
    }
  },
  
  mnemonicValidate(phrase: string) {
    assert(typeof phrase === 'string', 'invalid mnemonic phrase');
  }
};


