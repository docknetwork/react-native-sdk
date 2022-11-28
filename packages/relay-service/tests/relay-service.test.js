import {RelayService} from '../lib';
import {generatePayload} from '../lib/payloads';

const subject = 'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ';
const recipientDid = 'did:key:z6Mks8mvCnVx4HQcoq7ZwvpTbMnoRGudHSiEpXhMf6VW8XMg';

describe('Relay service', () => {
  describe('generateCredential', () => {
    it('expect to generated verifiable credential', async () => {
      const payload = await generatePayload();
      expect(payload.proof).toBeDefined();
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
        recipientDid: recipientDid,
      });

      expect(result.length).toBe(0);
    });
  });

  describe('sendMessage', () => {
    it('expect to assert parameters', async () => {
      const error = await RelayService.sendMessage({
        recipientDid: null,
      }).catch(err => err);

      expect(error.toString()).toContain('AssertionError');
    });
  });
});
