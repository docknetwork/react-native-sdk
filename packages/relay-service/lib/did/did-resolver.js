import {
  DockResolver,
  DIDKeyResolver,
  MultiResolver,
  UniversalResolver,
} from '@docknetwork/sdk/resolver';
import dock from '@docknetwork/sdk';


// Create a resolver in order to lookup DIDs for verifying
export const universalResolverUrl = 'https://uniresolver.io';
export const resolver = new MultiResolver(
  {
    dock: new DockResolver(dock), // Prebuilt resolver
    key: new DIDKeyResolver(), // did:key resolution
  },
  new UniversalResolver(universalResolverUrl),
);

export {
  dock,
};

