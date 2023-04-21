import AccountJSON from './account1.json';
import InvalidAccountJSON from './invalid-account.json';

const Account2MnemonicDetails = {
  mnemonic:
    'indicate mention thing discover clarify grief inherit vivid dish health market spoil',
  address: '39SiPt8AHxtThrWZNcQadD1MA7WAcmcedC89hqcU22ZYrJn2',
};

const AccountJSONPassword = 'test';

export {
  /**
   * Polkadot account JSON
   */
  AccountJSON,
  AccountJSONPassword,
  Account2MnemonicDetails,
  /**
   * Invalid account JSON used for testing error handlers
   */
  InvalidAccountJSON,
};
