import axios from 'axios';
import {RelayService} from '../lib';
import {generateSignedPayload} from '../lib/payloads';
import {ALICE_KEY_PAIR_DOC, BOB_KEY_PAIR_DOC} from './mock-data';

describe('Relay service', () => {
  describe('generateSignedPayload', () => {
    it('expect to assert parameters', async () => {
      const error = await generateSignedPayload(null, null).catch(err => err);

      expect(error.toString()).toContain('AssertionError');
    });

    it('expect to generate signed payload for did:dock', async () => {
      const result = await generateSignedPayload(ALICE_KEY_PAIR_DOC, {
        limit: 20,
      });

      expect(result).toBeDefined();
    });

    it('expect to generate signed payload for did:key', async () => {
      const result = await generateSignedPayload(BOB_KEY_PAIR_DOC, {limit: 20});

      expect(result).toBeDefined();
    });
  });

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

      expect(result).toBeDefined();
    });
  });

  describe('getMessages', () => {
    it('expect to assert parameters', async () => {
      const error = await RelayService.getMessages({
        keyPairDocs: null,
      }).catch(err => err);

      expect(error.toString()).toContain('AssertionError');
    });

    it('expect to get messages', async () => {
      jest.spyOn(axios, 'get').mockReturnValueOnce({data: ['test']});

      const result = await RelayService.getMessages({
        keyPairDocs: [BOB_KEY_PAIR_DOC],
        limit: 20,
      });

      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('registerDIDPushNotification', () => {
    it('expect to registerDIDPushNotification', async () => {
      jest.spyOn(axios, 'post').mockReturnValueOnce({data: ['test']});

      const result = await RelayService.registerDIDPushNotification({
        keyPairDocs: [BOB_KEY_PAIR_DOC],
        token: 'test',
      });

      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });
});
