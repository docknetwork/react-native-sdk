/**
 * Placeholder for QR Code handler integration tests
 * Expect to verify any qr code and dispatch proper actions to the wallet sdk
 *
 */
import {BasicCredential} from './data/credentials';

function handleQRCode(data) {}

describe('QR Core Handler', () => {
  it('expect to import credential via QR Code', async () => {
    await handleQRCode(BasicCredential);
  });

  it('expect to import account via QR Code', async () => {
    // implement this
  });

  it('expect to handle wallet address QR code', async () => {
    // implement this
  });

  it('expect to handle web3id auth QR code', async () => {
    // implement this
  });

  it('expect to import credential via QR code', async () => {
    // implement this
  });
});
