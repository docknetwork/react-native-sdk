// @ts-nocheck
/**
 * Format utils module
 *
 * @module core/format-utils
 */

import assert from 'assert';

/**
 * Format number as currency
 * @alias core/format-utils#formatCurrency
 * @example
 * const value = formatCurrency(10.5);
 * // value = $10.50
 *
 * @param {number} value
 * @param {string} currency
 * * @param {string} locale
 * @returns string
 */
export function formatCurrency(
  value,
  currency = 'USD',
  locale = 'en-US',
): string {
  assert(
    typeof value === 'number' || typeof value === 'bigint',
    'value must be a number or bigint',
  );

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,

    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

  return formatter.format(value);
}

/**
 *
 * @param date
 * @param locale
 * @returns {string}
 */
export function formatDate(date, locale = 'en-US') {
  assert(!!date, 'date is required');

  const dateFormat = new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return dateFormat.format(typeof date === 'string' ? new Date(date) : date);
}
