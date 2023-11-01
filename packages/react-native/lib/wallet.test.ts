import {
  walletEventEmitter,
  initializeWallet,
  getWallet,
  WalletEvents,
} from './wallet';

describe('Wallet handler', () => {
  it('expect to dispatchEvent to webview', async () => {
    jest.spyOn(walletEventEmitter, 'on');

    await initializeWallet();

    expect(getWallet()).toBeDefined();
    expect(walletEventEmitter.on).toBeCalledWith(
      WalletEvents.walletInitialized,
    );
  });
});
