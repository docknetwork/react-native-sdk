import {OpenID4VCIClientV1_0_13} from '@sphereon/oid4vci-client';
import {IWallet} from '../types';
import {IDIDProvider} from '../did-provider';
import {Alg} from '@sphereon/oid4vci-common';
import {didServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/dids';

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

  const queryString = uri.split('?')[1];
  const params = new URLSearchParams(queryString);
  const credentialOfferEncoded = params.get('credential_offer');
  const credentialOfferDecoded = decodeURIComponent(credentialOfferEncoded);
  const credentialOffer = JSON.parse(credentialOfferDecoded);
  const scope = credentialOffer.credentials[0];
  const format = 'ldp_vc';
  const credentialTypes = scope.replace('ldp_vc:', '');

  const client = await OpenID4VCIClientV1_0_13.fromURI({
    uri: uri,
    clientId: 'dock.wallet',
    authorizationRequest: {
      redirectUri: 'dock-wallet://credentials/callback',
      clientId: 'dock.wallet',
      scope: credentialOffer.credentials[0],
    },
  });

  let code;

  if (client.credentialOffer?.preAuthorizedCode) {
    code = client.credentialOffer?.preAuthorizedCode;
  } else {
    code = await getAuthCode(client.authorizationURL); 
    // TODO: Remove this return
    return;
  }

  await client.acquireAccessToken({
    code,
  });

  const response = await client.acquireCredentials({
    credentialTypes,
    proofCallbacks: {
      signCallback: async args => {
        // use service method here
        const jwt = await didServiceRPC.createSignedJWT({
          payload: args.payload,
          privateKeyDoc: holderKeyDocument,
          headerInput: args.header,
        });

        return jwt;
      },
    },
    format: format,
    alg: Alg.EdDSA,
    kid: holderKeyDocument.id,
  });

  return response.credential;
}
