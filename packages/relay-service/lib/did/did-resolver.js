import {
  DockResolver,
  DIDKeyResolver,
  MultiResolver,
  UniversalResolver,
} from '@docknetwork/sdk/resolver';
import dock from '@docknetwork/sdk';

// Create a resolver in order to lookup DIDs for verifying
export const universalResolverUrl = 'https://uniresolver.io';

class WalletSDKResolver extends MultiResolver {
  async resolve(did) {
    console.log('resolve', did);
    const trimmedDID = did.split('#')[0];
    console.log('trimmedDID', trimmedDID);
    const document = await super.resolve(trimmedDID);
    console.log('document', document);
    return document;
  }
}

export const resolver = new WalletSDKResolver(
  {
    dock: new DockResolver(dock), // Prebuilt resolver
    key: new DIDKeyResolver(), // did:key resolution
  },
  new UniversalResolver(universalResolverUrl),
);

export {dock};
