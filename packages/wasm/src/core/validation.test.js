import {isNumberValid} from './validation';

describe('core validation', () => {
  it('isNumberValid', () => {
    expect(isNumberValid('this is not valid')).toBeFalsy();
    expect(isNumberValid(false)).toBeFalsy();
    expect(isNumberValid(10)).toBeTruthy();
  });
});
