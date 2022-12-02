import {RelayService} from '../lib';
import {generatePayload} from '../lib/payloads';
import { ALICE_KEY_PAIR_DOC, BOB_KEY_PAIR_DOC } from './mock-data';

describe('Relay service', () => {
  describe('sendMessage', () => {
    it('expect to assert parameters', async () => {
      const error = await RelayService.sendMessage({
        keyPairDoc: null,
        message: null,
        recipientDid: null,
      }).catch(err => err);

      expect(error.toString()).toContain('AssertionError');
    });

    it('expect to send message', async () => {
      const result = await RelayService.sendMessage({
        keyPairDoc: BOB_KEY_PAIR_DOC,
        message: 'Test',
        recipientDid: ALICE_KEY_PAIR_DOC.controller,
      });
    });
  });

  describe('getMessages', () => {
    it('expect to assert parameters', async () => {
      const error = await RelayService.getMessages({
        recipientDid: null,
      }).catch(err => err);

      expect(error.toString()).toContain('AssertionError');
    });

    it('expect to get messages', async () => {
      const result = await RelayService.getMessages({
        keyPairDoc: ALICE_KEY_PAIR_DOC,
        limit: 20
      });

      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });
});
