import {getWallet} from './wallet-helpers';

export function getVerificationTemplates() {
  return getWallet().query({
    type: 'VerificationRequestTemplate',
  } as any);
}
