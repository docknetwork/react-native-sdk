import {RelayService} from '../lib';
import {dock} from '../lib/did/did-resolver';
import {ALICE_KEY_PAIR_DOC, BOB_KEY_PAIR_DOC} from './mock-data';

describe('Relay service', () => {
  const messageContent = `Test message ${Date.now()}`;

  beforeAll(async () => {
    await dock.init({
      address: 'wss://knox-1.dock.io',
    });
  });

  test('Alice can send BOB a message', async () => {
    const result = await RelayService.sendMessage({
      keyPairDoc: ALICE_KEY_PAIR_DOC,
      message: messageContent,
      recipientDid: BOB_KEY_PAIR_DOC.controller,
    });

    expect(result.success).toBeTruthy();
  });

  test('BOB can fetch message sent by Alice', async () => {
    const messages = await RelayService.getMessages({
      keyPairDocs: [BOB_KEY_PAIR_DOC, ALICE_KEY_PAIR_DOC],
      limit: 40,
    });

    const message = messages[0];

    expect(message._id).toBeDefined();
    expect(message.to).toBe(BOB_KEY_PAIR_DOC.controller);
    expect(message.from).toBe(ALICE_KEY_PAIR_DOC.controller);
    expect(message.msg).toBe(messageContent);
  });
});
