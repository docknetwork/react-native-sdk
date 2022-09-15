import {
  formatAddress,
  formatCurrency,
  formatDate,
  getPlainDockAmount,
} from './format-utils';

const sr25519Address = '395pw1L5R4XiScC2BGRrSSSH6fadFuGSTfUcqA5cHPyA21eQ';
const ed25519Address = '38yWnWt8k3j5BuxssLAH43t5cNevxyShkCAMEx8su3nSsayh';

describe('Format util', () => {
  it('expect to format sr25519 address', () => {
    expect(formatAddress(sr25519Address)).toBe('395pw1L5R...5cHPyA21eQ');
  });

  it('expect to format ed25519Address address', () => {
    expect(formatAddress(ed25519Address)).toBe('38yWnWt8k...8su3nSsayh');
  });

  it('expect to validate address length', () => {
    expect(formatAddress(sr25519Address, sr25519Address.length + 10)).toBe(
      sr25519Address,
    );
  });

  it('getPlainDockAmount', () => {
    const amount = getPlainDockAmount(10);
    expect(amount.toNumber()).toBe(10000000);
  });

  it('formatCurrency', () => {
    const result = formatCurrency(12.55);
    expect(result).toBe('$12.55');

    const result1 = formatCurrency(0);
    expect(result1).toBe('$0.00');
  });

  it('format Date', () => {
    const date = new Date(1996, 11, 17);
    const result = formatDate(date);
    expect(result).toBe('December 17, 1996 at 12:00 AM');
  });
});
