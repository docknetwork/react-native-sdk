// @ts-nocheck
import assert from 'assert';
import {assertAddress} from '../../core/validation';

export const validation = {
  mnemonicGenerate(numWords: number) {
    if (numWords) {
      assert(typeof numWords === 'number', 'invalid number of words');
    }
  },

  mnemonicToMiniSecret(phrase: string) {
    assert(typeof phrase === 'string', 'invalid mnemonic phrase');
  },
};
