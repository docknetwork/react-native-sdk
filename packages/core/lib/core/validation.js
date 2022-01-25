import BigNumber from 'bignumber.js';

export function isNumberValid(v: any) {
  if (v instanceof BigNumber) {
    return true;
  }

  return !isNaN(parseInt(v, 10));
}

export function isAddressValid(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  if (!address.trim()) {
    return false;
  }

  return true;
}
