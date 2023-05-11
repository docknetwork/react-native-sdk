import {Credentials} from '@docknetwork/wallet-sdk-credentials/lib';
import {getWallet} from './wallet-helpers';

export async function getCredentials() {
  Credentials.getInstance().wallet = getWallet();
  return Credentials.getInstance().query({});
}

export async function getCredentialById(id) {
  const items = await getCredentials();
  return items.find(item => item.id === id);
}

export async function importCredentialJSON(json) {
  Credentials.getInstance().wallet = getWallet();
  return Credentials.getInstance().add(json);
}

export async function removeCredential(credentialId) {
  Credentials.getInstance().wallet = getWallet();
  return Credentials.getInstance().remove(credentialId);
}
