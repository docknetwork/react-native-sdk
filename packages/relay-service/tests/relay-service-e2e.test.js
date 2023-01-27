import {RelayService} from '../lib';
import {ALICE_KEY_PAIR_DOC, BOB_KEY_PAIR_DOC} from './mock-data';

describe('Relay service', () => {
  const messageContent = `Test message ${Date.now()}`;

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
      limit: 20,
    });

    const message = messages.find(msg => msg.msg === messageContent);

    expect(message._id).toBeDefined();
    expect(message.to).toBe(BOB_KEY_PAIR_DOC.controller);
    expect(message.from).toBe(ALICE_KEY_PAIR_DOC.controller);
    expect(message.msg).toBe(messageContent);
  });
});
