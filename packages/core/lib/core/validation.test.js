import BigNumber from 'bignumber.js';
import {isAddressValid, isNumberValid} from './validation';

describe('core validation', () => {
  it('isAddressValid', () => {
    expect(isAddressValid(' ')).toBeFalsy();
    expect(isAddressValid('   ')).toBeFalsy();
    expect(isAddressValid('')).toBeFalsy();
    expect(isAddressValid(null)).toBeFalsy();
    expect(isAddressValid(undefined)).toBeFalsy();
    expect(isAddressValid(123)).toBeFalsy();
    expect(isAddressValid('address')).toBeTruthy();
  });

  it('isNumberValid', () => {
    expect(isNumberValid('100000000')).toBeTruthy();
    expect(isNumberValid('this is not valid')).toBeFalsy();
    expect(isNumberValid(false)).toBeFalsy();
    expect(isNumberValid(10)).toBeTruthy();
    expect(isNumberValid(BigNumber(1))).toBeTruthy();
  });
});
