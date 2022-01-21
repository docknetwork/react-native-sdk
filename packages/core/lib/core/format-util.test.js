import {formatAddress} from './format-utils';

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
});
