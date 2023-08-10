import {dock, universalResolverUrl} from '../lib/did/did-resolver';
import {
  didcommCreateEncrypted,
  didcommDecrypt,
  DIDCOMM_TYPE_ISSUE_DIRECT,
  getDerivedAgreementKey,
} from '../lib/didcomm';
import {ALICE_KEY_PAIR_DOC, BOB_KEY_PAIR_DOC} from './mock-data';
import {dockService} from '@docknetwork/wallet-sdk-wasm/src/services/dock/service';
import {
  DockResolver,
  DIDKeyResolver,
  MultiResolver,
  UniversalResolver,
} from '@docknetwork/sdk/resolver';

const didList = [ALICE_KEY_PAIR_DOC, BOB_KEY_PAIR_DOC];

class WalletSDKResolver extends MultiResolver {
  async resolve(did) {
    const trimmedDID = did.split('#')[0];
    const document = didList.find(
      doc => doc.controller === trimmedDID,
    )?.didResolution;

    if (!document) {
      throw new Error(`Mock document not found for did: ${trimmedDID}`);
    }

    return document;
  }
}

const mockDIDResolver = new WalletSDKResolver(
  {
    dock: new DockResolver(dock),
    did: new DIDKeyResolver(),
  },
  new UniversalResolver(universalResolverUrl),
);

dockService.createDIDResolver = () => mockDIDResolver;
dockService.resolver = mockDIDResolver;

describe('DIDComm', () => {
  it('expect to decrypt didcomm message', async () => {
    dockService.resolver = mockDIDResolver;

    const keyAgreementKey = await getDerivedAgreementKey(ALICE_KEY_PAIR_DOC);

    const payload = {domain: 'api.dock.io', message: 'test'};
    const jwe = await didcommCreateEncrypted({
      recipientDids: [BOB_KEY_PAIR_DOC.id],
      type: DIDCOMM_TYPE_ISSUE_DIRECT,
      senderDid: ALICE_KEY_PAIR_DOC.controller,
      payload,
      keyAgreementKey,
    });

    expect(jwe.typ).toBe('application/didcomm-encrypted+json');
    expect(jwe.ciphertext).toBeDefined();

    const decrypted = await didcommDecrypt(
      jwe,
      await getDerivedAgreementKey(BOB_KEY_PAIR_DOC),
    );

    expect(decrypted.body).toStrictEqual(payload);
  });
});
