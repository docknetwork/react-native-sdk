import {formatCurrency, formatDate} from './format-utils';

describe('Format util', () => {
  it('formatCurrency', () => {
    const result = formatCurrency(12.55);
    expect(result).toBe('$12.55');

    const result1 = formatCurrency(0);
    expect(result1).toBe('$0.00');
  });

  it('format Date', () => {
    const date = new Date(1996, 11, 17);
    const result = formatDate(date);
    expect(result).toBe('December 17, 1996');
  });
});
