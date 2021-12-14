import BigNumber from 'bignumber.js';

export const DOCK_TOKEN_UNIT = 1000000;

export function formatCurrency(value, currency = 'USD') {
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,

    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

  return formatter.format(value);
}

export function formatAddress(value, size = 19) {
  if (!value || size > value.length) {
    return value;
  }

  const offset = size / 2;
  return `${value.substring(0, offset)}...${value.substring(
    value.length - offset,
  )}`;
}

export function formatDockAmount(value) {
  return BigNumber(value).dividedBy(DOCK_TOKEN_UNIT).toNumber();
}

export function getPlainDockAmount(value) {
  return BigNumber(value).times(DOCK_TOKEN_UNIT);
}

const dateFormat = new Intl.DateTimeFormat(['en-US'], {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatDate(date) {
  return dateFormat.format(typeof date === 'string' ? new Date(date) : date);
}
