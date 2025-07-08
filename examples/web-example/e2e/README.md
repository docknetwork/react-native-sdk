# E2E Tests for Wallet SDK Web Example

This directory contains end-to-end tests for the Wallet SDK Web Example application using Playwright.

## Test Coverage

1. **App Loading Tests** (`app-loading.spec.ts`)
   - Application loads successfully (shows either welcome screen or documents page)
   - Shows wallet setup options when no wallet exists
   - Handles wallet key file upload and loads documents page

2. **Wallet Creation Tests** (`wallet-creation.spec.ts`)
   - Creates a new wallet successfully with automatic DID generation
   - Displays default DID after wallet creation (automatically created)
   - Clears wallet data but preserves keys for reload
   - Persists wallet after page reload

3. **Credential Management Tests** (`credential-management.spec.ts`)
   - Import credential modal functionality
   - Credential URL validation (shows alert for invalid URLs)
   - Credential import flow (skipped - requires real credential URL)
   - Fetch messages functionality
   - Copy DID to clipboard

## Setup

### Prerequisites

1. Install dependencies:
```bash
yarn install
```

2. **Important**: Install Playwright browsers (required for tests to run):
```bash
yarn playwright install
```

Without this step, you'll get "Executable doesn't exist" errors.

## Running Tests

### Basic Commands

```bash
# Run all e2e tests (Chrome only by default)
yarn test:e2e

# Run tests in UI mode (interactive, great for development)
yarn test:e2e:ui

# Run tests in headed mode (see browser actions)
yarn test:e2e:headed

# Run tests in debug mode (step-by-step)
yarn test:e2e:debug

# Show test report after running
yarn test:e2e:report
```

### Running Specific Tests

```bash
# Run a specific test file
yarn playwright test e2e/app-loading.spec.ts

# Run tests matching a pattern
yarn playwright test -g "should create a new wallet"

# Run a specific test by name
yarn playwright test e2e/wallet-creation.spec.ts -g "should create a new wallet successfully"

# Run only failing tests from last run
yarn playwright test --last-failed
```

### Browser Configuration

The tests are currently configured to run **only on Chrome** for faster execution. To modify this, edit `playwright.config.ts`:

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  // Uncomment to add other browsers:
  // {
  //   name: 'firefox',
  //   use: { ...devices['Desktop Firefox'] },
  // },
  // {
  //   name: 'webkit',
  //   use: { ...devices['Desktop Safari'] },
  // },
],
```

## Debugging Tests

### Visual Debugging

```bash
# Run tests in headed mode to see browser actions
yarn playwright test --headed

# Run tests in debug mode with step-by-step execution
yarn playwright test --debug

# Run a specific failing test in debug mode
yarn playwright test e2e/wallet-creation.spec.ts -g "should create" --debug

# Run with browser console output
yarn playwright test --headed --reporter=line
```

### Debugging Tools

```bash
# Generate test code by recording interactions
yarn playwright codegen http://localhost:3000

# Run single test with maximum verbosity
yarn playwright test e2e/app-loading.spec.ts --headed --debug --reporter=line

# Run tests with custom timeout
yarn playwright test --timeout=60000

# Keep browser open after test completion
yarn playwright test --headed --debug --pause-on-failure
```

### Analyzing Test Results

Tests automatically capture on failure:
- **Screenshots** (`test-results/*/test-failed-*.png`)
- **Videos** (`test-results/*/video.webm`)
- **Traces** for debugging (`test-results/*/trace.zip`)
- **Error context** (`test-results/*/error-context.md`)

```bash
# Open the HTML report to view test results
yarn playwright show-report

# View traces for failed tests (very detailed)
yarn playwright show-trace test-results/path-to-trace.zip
```

### Adding Debug Logs

```javascript
test('my test', async ({ page }) => {
  console.log('Starting test...');
  
  // Enable browser console logs in test output
  page.on('console', msg => console.log('Browser:', msg.text()));
  
  // Take screenshot at specific point
  await page.screenshot({ path: 'debug-screenshot.png' });
  
  await page.goto('/');
  // ... rest of test
});
```

## Environment Variables

```bash
# For credential import tests (currently skipped by default)
export TEST_CREDENTIAL_URL="openid-credential-offer://your-test-url"
export TEST_PROOF_REQUEST_URL="https://your-proof-request-url"

# Run tests with environment variables
yarn test:e2e
```

## Common Issues and Solutions

### 1. "Executable doesn't exist" Error

**Problem**: Playwright browsers not installed
```bash
# Solution
yarn playwright install
```

### 2. Tests Timing Out

**Problem**: App takes too long to start, load, or wallet creation is slow

**Solutions**:
- Check if dev server starts properly
- Increase timeout in `playwright.config.ts`
- Ensure all dependencies are installed
- Wait for specific elements instead of using fixed timeouts

```javascript
// Good: Wait for specific element
await page.waitForSelector('text=Documents', { timeout: 30000 });

// Avoid: Fixed timeouts
await page.waitForTimeout(5000);
```

### 3. "Loading..." Not Found

**Problem**: App loads too quickly and doesn't show loading state

**Solution**: Tests have been updated to handle this - the app may show either welcome screen or documents page depending on wallet state.

### 4. Dialog/Alert Handling Issues

**Problem**: Tests fail when trying to handle browser alerts

```javascript
// Correct way to handle dialogs
page.on('dialog', async dialog => {
  console.log('Dialog message:', dialog.message());
  await dialog.accept();
});

// Click button that triggers dialog
await page.getByRole('button', { name: 'Import' }).click();
```

### 5. LocalStorage State Issues

**Problem**: Wallet state persists between tests causing failures

```javascript
// Clear localStorage before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
```

### 6. DID Creation Expectations

**Problem**: Tests expect manual DID creation but app creates DIDs automatically

**Solution**: Tests have been updated - DIDs are created automatically when wallet is initialized. Look for "Default DID:" text instead of "Create Default DID" button.

### 7. Clear Wallet Behavior

**Problem**: Tests expect full localStorage clear but app preserves wallet keys

**Solution**: The Clear Wallet button preserves wallet keys but clears other data. Tests have been updated to reflect this behavior.

## Test Configuration

### Key Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'yarn start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for server start
  },
});
```

### Useful Config Modifications

```typescript
// For debugging: capture more traces
use: {
  trace: 'on', // Captures trace for all tests
}

// For slow operations: increase timeouts
use: {
  actionTimeout: 10000, // 10 seconds for actions
  navigationTimeout: 30000, // 30 seconds for navigation
}

// For CI: reduce workers and increase retries
workers: process.env.CI ? 1 : 4,
retries: process.env.CI ? 3 : 1,
```

## CI/CD Considerations

For continuous integration:

```yaml
# Example GitHub Actions configuration
- name: Install dependencies
  run: yarn install

- name: Install Playwright browsers
  run: yarn playwright install

- name: Run e2e tests
  run: yarn test:e2e
  env:
    CI: true

- name: Upload test results on failure
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

**CI Best Practices**:
1. Use single worker to avoid race conditions
2. Increase retries for flaky tests
3. Set `CI=true` environment variable
4. Upload artifacts on failure
5. Use headless mode (default)

## Writing New Tests

### Test Structure Template

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Clear state and navigate
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Wait for app to be ready
    const welcomeText = page.getByText('Welcome to the Wallet App');
    const documentsText = page.getByText('Documents');
    await expect(welcomeText.or(documentsText)).toBeVisible();
  });

  test('should do something specific', async ({ page }) => {
    // Test implementation with meaningful assertions
    await expect(page.getByText('Expected Text')).toBeVisible();
  });
});
```

### Best Practices for Writing Tests

1. **Use semantic selectors**:
   ```javascript
   // Good
   await page.getByRole('button', { name: 'Create New Wallet' }).click();
   await page.getByText('Welcome to the Wallet App');
   
   // Avoid CSS selectors when possible
   await page.locator('.button-class').click();
   ```

2. **Wait for elements, don't use fixed timeouts**:
   ```javascript
   // Good
   await expect(page.getByText('Documents')).toBeVisible({ timeout: 10000 });
   
   // Avoid
   await page.waitForTimeout(5000);
   ```

3. **Handle async operations properly**:
   ```javascript
   // Wait for wallet creation to complete
   await page.getByRole('button', { name: 'Create New Wallet' }).click();
   await page.waitForSelector('.App-header:has-text("Documents")', { timeout: 30000 });
   ```

4. **Clean up state between tests**:
   ```javascript
   test.beforeEach(async ({ page }) => {
     await page.goto('/');
     await page.evaluate(() => localStorage.clear());
     await page.reload();
   });
   ```

5. **Use meaningful test names**:
   ```javascript
   test('should create a new wallet and display documents page');
   test('should validate credential URL format and show error');
   ```

6. **Handle browser dialogs**:
   ```javascript
   page.on('dialog', async dialog => {
     expect(dialog.message()).toContain('Expected message');
     await dialog.accept();
   });
   ```

## Current Test Status

**All tests are currently passing** ✅

- **11 tests passed**
- **1 test skipped** (credential import - requires real credential URL)
- **0 tests failed**

### Skipped Tests

The credential import test is skipped by default because it requires a real credential offer URL. To enable it:

1. Set environment variable: `TEST_CREDENTIAL_URL="openid-credential-offer://your-url"`
2. Remove `.skip` from the test in `credential-management.spec.ts`

## Troubleshooting Checklist

When tests fail:

1. **Check the basics**:
   - Are dependencies installed? (`yarn install`)
   - Are browsers installed? (`yarn playwright install`)
   - Is the dev server starting properly?

2. **Run tests visually**:
   ```bash
   yarn playwright test --headed --debug
   ```

3. **Check test artifacts**:
   - Screenshots in `test-results/`
   - Videos of test execution
   - Browser console output

4. **Verify app behavior manually**:
   - Start dev server: `yarn start`
   - Test the failing functionality manually in browser

5. **Check for timing issues**:
   - Wallet creation and DID generation can be slow
   - Cloud wallet initialization may take time
   - Wait for specific elements rather than using fixed delays

6. **Review test expectations**:
   - Do they match current app behavior?
   - Has the app been updated but tests haven't?

For more help, see the [Playwright documentation](https://playwright.dev/docs/intro).