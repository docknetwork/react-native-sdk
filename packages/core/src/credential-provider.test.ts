import { ACUMM_WITNESS_PROP_KEY, ICredentialProvider, createCredentialProvider } from "./credential-provider";
import { IWallet, createWallet } from "./wallet";

import biometricsBBSRevocation from './fixtures/biometrics-credential-bbs-revocation.json';

describe('CredentialProvider', () => {

  let wallet: IWallet;
  let provider: ICredentialProvider;

  beforeEach(async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
    });
    
    provider = createCredentialProvider({ wallet });
  });

  describe('addCredential', () => {
    it('should add a credential to the wallet', async () => {
      await provider.addCredential({
        ...biometricsBBSRevocation,
      });

      const cred = await provider.getById(biometricsBBSRevocation.id);

      expect(cred.id).toBe(biometricsBBSRevocation.id);

      const witness = await provider.getMembershipWitness(cred.id);

      expect(witness).toBe(biometricsBBSRevocation[ACUMM_WITNESS_PROP_KEY]);
    });
  });
});