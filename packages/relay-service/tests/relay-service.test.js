import axios from 'axios';
import {didcomm, RelayService} from '../lib';
import {generateSignedPayload, toBase64} from '../lib/payloads';
import {ALICE_KEY_PAIR_DOC, BOB_KEY_PAIR_DOC} from './mock-data';

describe('Relay service', () => {
  beforeEach(() => {
    jest.spyOn(didcomm, 'encrypt').mockImplementationOnce(msg => msg);
    jest.spyOn(didcomm, 'decrypt').mockImplementationOnce(msg => msg);
  });

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
      jest.spyOn(axios, 'get').mockReturnValueOnce({
        data: [
          {
            to: BOB_KEY_PAIR_DOC.controller,
            msg: toBase64(JSON.stringify({test: 'test'})),
          },
        ],
      });

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

  describe('resolveDidcommMessage', () => {
    let didCommMessage;
    let payload;

    beforeAll(async () => {
      payload = {test: 'test'};
      didCommMessage = await didcomm.encrypt({
        recipientDids: [BOB_KEY_PAIR_DOC.controller],
        type: 'test',
        senderDid: ALICE_KEY_PAIR_DOC.controller,
        payload,
      });
    });

    it('expect to resolve JSON message', async () => {
      const result = await RelayService.resolveDidcommMessage({
        message: {
          to: BOB_KEY_PAIR_DOC.controller,
          msg: toBase64(didCommMessage),
        },
        keyPairDocs: [BOB_KEY_PAIR_DOC],
      });

      expect(result.payload).toStrictEqual({test: 'test'});
    });

    it('expect to handle URL', async () => {
      // TODO: mock axios.get to return didComm message
      // const result = await RelayService.resolveDidcommMessage({
      //   message: 'didcomm://https://relay.dock.io/read/msgid',
      //   keyPairDocs: [BOB_KEY_PAIR_DOC],
      // });

      // expect(result.payload).toStrictEqual(payload);
    });

    it('expect to handle base64 JSON', async () => {
      // TODO: mock axios.get to return didComm message
      // const result = await RelayService.resolveDidcommMessage({
      //   message: `didcomm://${toBase64(didCommMessage)}`,
      //   keyPairDocs: [BOB_KEY_PAIR_DOC],
      // });

      // expect(result.payload).toStrictEqual(payload);
    });
  });
});
