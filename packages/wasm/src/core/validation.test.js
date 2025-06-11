import {
  assertAddress,
  assertTokenAmount,
  isAddressValid,
  isNumberValid,
} from './validation';

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
    expect(isNumberValid('this is not valid')).toBeFalsy();
    expect(isNumberValid(false)).toBeFalsy();
    expect(isNumberValid(10)).toBeTruthy();
  });

  it('assertAddress', () => {
    expect(() => assertAddress(' ')).toThrow(`invalid address: ${' '}`);
    expect(() => assertAddress(null)).toThrow('invalid address: null');
    expect(() => assertAddress('address')).not.toThrow();
  });

  it('assertTokenAmount', () => {
    expect(() => assertTokenAmount(' ')).toThrow('invalid token amount');
    expect(() => assertTokenAmount('abc')).toThrow('invalid token amount');
    expect(() => assertTokenAmount(null)).toThrow('invalid token amount');
    expect(() => assertTokenAmount('10')).not.toThrow();
    expect(() => assertTokenAmount(100)).not.toThrow();
  });
});
