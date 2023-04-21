/**
 *
 */
import {
  cleanup,
  createAccounts,
  createNewWallet,
  setupEnvironent,
} from './helpers';

describe('Verification Templates', () => {
  beforeAll(async () => {
    await cleanup();
    await setupEnvironent();
    await createNewWallet();
    await createAccounts();
  });

  it('expect to import VerificationTemplates', () => {});
  it('expect to filter credentials for a verification template', () => {});
});
