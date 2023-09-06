import {
  DockResolver,
  DIDKeyResolver,
  WildcardMultiResolver,
  UniversalResolver,
} from '@docknetwork/sdk/resolver';
import dock from '@docknetwork/sdk';

// Create a resolver in order to lookup DIDs for verifying
export const universalResolverUrl = 'https://uniresolver.io';

// class WalletSDKResolver extends WildcardMultiResolver {
//   static PREFIX = WILDCARD;
//   static METHOD = WILDCARD;

//   async resolve(did) {
//     const trimmedDID = did.split('#')[0];
//     const document = await super.resolve(trimmedDID);
//     return document;
//   }
// }

export const resolver = new WildcardMultiResolver(
  // {
  //   dock: new DockResolver(dock), // Prebuilt resolver
  //   key: new DIDKeyResolver(), // did:key resolution
  // },
  [
    new DockResolver(dock),
    new DIDKeyResolver(),
    new UniversalResolver(universalResolverUrl),
  ],
);

export {dock};
