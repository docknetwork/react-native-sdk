
import {IWallet} from '../types';
import {IDIDProvider} from '../did-provider';
import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';

export async function acequireOpenIDCredentialFromURI({
  didProvider,
  uri,
  getAuthCode,
}: {
  didProvider: IDIDProvider;
  uri: string;
  getAuthCode?: (authorizationURL: string) => Promise<string>;
}) {
  const [holderKeyDocument] = await didProvider.getDIDKeyPairs();

  let response = await credentialServiceRPC.acequireOIDCredential({
    uri,
    holderKeyDocument,
  });

  if (response.authorizationURL) {
    const authorizationCode = await getAuthCode(response.authorizationURL);
    response = await credentialServiceRPC.acequireOIDCredential({
      uri,
      holderKeyDocument,
      authorizationCode,
    });
  }

  return response.credential;
}
