/**
 * Format utils module
 *
 * @module core/format-utils
 */

import assert from 'assert';
import BigNumber from 'bignumber.js';
import {isNumberValid} from './validation';

export const DOCK_TOKEN_UNIT = 1000000;

/**
 * Format number as currency
 * @alias core/format-utils#formatCurrency
 * @example
 * const value = formatCurrency(10.5);
 * // value = $10.50
 *
 * @param {number} value
 * @param {string} currency
 * @returns string
 */
export function formatCurrency(value, currency = 'USD'): string {
  assert(
    typeof value === 'number' || typeof value === 'bigint',
    'value must be a number or bigint',
  );

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,

    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

  return formatter.format(value);
}

export function formatAddress(address, size = 19) {
  assert(!!address, 'address is required');
  assert(typeof address === 'string', 'address must be a string');

  if (!address || size > address.length) {
    return address;
  }

  const offset = size / 2;

  return `${address.substring(0, offset)}...${address.substring(
    address.length - offset,
  )}`;
}

export function formatDockAmount(value) {
  assert(!!value, 'value is required');
  assert(isNumberValid(value), 'value is not valid');

  return BigNumber(value).dividedBy(DOCK_TOKEN_UNIT).toNumber();
}

export function getPlainDockAmount(value) {
  assert(!!value, 'value is required');
  assert(isNumberValid(value), 'value is not valid');

  return BigNumber(value).times(DOCK_TOKEN_UNIT);
}

const dateFormat = new Intl.DateTimeFormat('en', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
});

export function formatDate(date) {
  assert(!!date, 'date is required');

  return dateFormat.format(typeof date === 'string' ? new Date(date) : date);
}
