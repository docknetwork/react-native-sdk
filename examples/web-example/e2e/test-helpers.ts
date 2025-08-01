import { Page } from '@playwright/test';

export async function setupWalletWithDID(page: Page) {
  // Clear localStorage and create a new wallet with DID
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  
  // Create new wallet
  await page.getByRole('button', { name: 'Create New Wallet' }).click();
  await page.waitForSelector('.App-header:has-text("Documents")', { timeout: 30000 });
  
  // Create default DID
  await page.getByRole('button', { name: 'Create Default DID' }).click();
  await page.waitForSelector('text=Default DID:', { timeout: 30000 });
}

export async function uploadWalletKeyFile(page: Page, walletKeys: any) {
  // Upload a wallet key file
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Upload Wallet Key File' }).click();
  const fileChooser = await fileChooserPromise;
  
  const buffer = Buffer.from(JSON.stringify(walletKeys));
  await fileChooser.setFiles([{
    name: 'test-wallet-keys.json',
    mimeType: 'application/json',
    buffer: buffer
  }]);
}

export function generateMockWalletKeys() {
  return {
    masterKey: Array.from(new Uint8Array(32).fill(1)),
    mnemonic: "test mnemonic phrase for testing purposes only"
  };
}

export async function waitForWalletLoad(page: Page) {
  // Wait for the wallet to fully load
  await page.waitForSelector('.App-header:has-text("Documents")', { timeout: 30000 });
}