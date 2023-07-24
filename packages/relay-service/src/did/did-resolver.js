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
    const trimmedDID = did.split('#')[0];
    const document = await super.resolve(trimmedDID);
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
