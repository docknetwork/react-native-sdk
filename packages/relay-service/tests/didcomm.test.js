import {RelayService} from '../lib';
import {dock} from '../lib/did/did-resolver';
import {
  didcommCreateEncrypted,
  didcommDecrypt,
  DIDCOMM_TYPE_ISSUE_DIRECT,
  getAgreementKeydocFromDidDocument,
  getDerivedAgreementKey,
  getKaKInstanceFromDocument,
} from '../lib/didcomm';
import {ALICE_KEY_PAIR_DOC, BOB_KEY_PAIR_DOC} from './mock-data';

describe('DIDComm', () => {
  it('expect to decrypt didcomm message', async () => {
    await dock.init({
      address: 'wss://knox-1.dock.io',
    });

    const keyAgreementKey = await getDerivedAgreementKey(ALICE_KEY_PAIR_DOC);

    const jwe = await didcommCreateEncrypted({
      recipientDids: [BOB_KEY_PAIR_DOC.id],
      type: DIDCOMM_TYPE_ISSUE_DIRECT,
      senderDid: ALICE_KEY_PAIR_DOC.id,
      payload: {domain: 'api.dock.io', message: 'test'},
      keyAgreementKey,
    });

    console.log(jwe);
  });
});
