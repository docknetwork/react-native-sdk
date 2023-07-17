import assert from 'assert';
import {isNumberValid} from '../../core/validation';

export const validation = {
  sum(params: SumParams) {
    assert(isNumberValid(params.number1), 'invalid number1');
    assert(isNumberValid(params.number2), 'invalid number2');
  },
};

export type SumParams = {
  number1: number,
  number2: number,
};
