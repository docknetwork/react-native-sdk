import { test, expect } from '@playwright/test';

test.describe('App Loading', () => {
  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');

    // Should show either welcome screen (no wallet) or wallet interface (wallet exists)
    const welcomeText = page.getByText('Welcome to the Wallet App');
    const credentialsText = page.getByText('Credentials (');

    // Wait for either welcome or credentials section to be visible
    await expect(welcomeText.or(credentialsText)).toBeVisible();
  });

  test('should show wallet setup options when no wallet exists', async ({ page }) => {
    // Clear localStorage to ensure no wallet exists
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Should show welcome message
    await expect(page.getByText('Welcome to the Wallet App')).toBeVisible();
    await expect(page.getByText('Please upload your wallet key file or create a new wallet.')).toBeVisible();
    
    // Should show both wallet creation options
    await expect(page.getByRole('button', { name: 'Upload Wallet Key File' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create New Wallet' })).toBeVisible();
  });

  test('should handle wallet key file upload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Create a mock wallet key file
    const walletKeys = {
      masterKey: Array.from(new Uint8Array(32).fill(1)),
      mnemonic: "test mnemonic phrase for testing purposes only"
    };
    
    // Upload the file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Upload Wallet Key File' }).click();
    const fileChooser = await fileChooserPromise;
    
    // Create a file from the JSON data
    const buffer = Buffer.from(JSON.stringify(walletKeys));
    await fileChooser.setFiles([{
      name: 'test-wallet-keys.json',
      mimeType: 'application/json',
      buffer: buffer
    }]);
    
    // After file upload, should eventually show the credentials section
    // Wait for the credentials section to appear (may briefly show loading)
    await expect(page.getByText('Credentials (')).toBeVisible({ timeout: 10000 });
  });
});