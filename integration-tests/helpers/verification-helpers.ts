import {getWallet} from './wallet-helpers';

export async function getVerificationTemplates() {
  const wallet = await getWallet();
  return wallet.query({
    type: 'VerificationRequestTemplate',
  } as any);
}
