import assert from 'assert';
import {isAddressValid, isNumberValid} from '../../core/validation';

const assertTransaction = ({
  toAddress,
  fromAddress,
  amount,
}: TransactionParams) => {
  assert(isAddressValid(toAddress), 'invalid toAddress');
  assert(isAddressValid(fromAddress), 'invalid fromAddress');
  assert(isNumberValid(amount), 'invalid amount');
};

export const validation = {
  getAccountBalance({address}: GetAccountBalanceParams) {
    assert(isAddressValid(address), `invalid address ${address}`);
  },
  getFeeAmount: assertTransaction,
  sendTokens: assertTransaction,
};

export const serviceName = 'substrate';

export type GetAccountBalanceParams = {
  address: string,
};

export type TransactionParams = {
  toAddress: string,
  fromAddress: string,
  amount: number | string,
  transferAll?: boolean,
};
