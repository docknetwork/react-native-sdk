import {DIDKeyManager} from '@docknetwork/wallet-sdk-dids';

class DIDService {
  async keypairToDidKeyDocument({keypairDoc}) {
    const {didDocument} = await DIDKeyManager.keypairToDidKeyDocument(
      keypairDoc,
    );
    return DIDKeyManager.getDidResolution(didDocument);
  }
}

export const didService = new DIDService();
