import {IWallet} from './types';
import {createVerificationProvider} from './verification-provider';
import {createWallet} from './wallet';

describe('Verification provider', () => {
  let verificationProvider;
  let wallet: IWallet;

  beforeAll(async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
    });
    verificationProvider = createVerificationProvider({
      wallet,
    });
  });

  it('expect to create verification controller', () => {
    const controller = verificationProvider.start({
      template: 'https://creds-testnet.dock.io/proof/6de279ba-caf3-4979-a067-553284b40767',
    });

    console.log(controller);
  });
});
