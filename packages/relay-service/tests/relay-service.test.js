import { RelayService } from '../lib';


describe('Relay service', () => {
  describe('getMessages', () => {
    it('expect to assert parameters', async () => {
      const error = await RelayService.getMessages({
        recipientDid: null
      }).catch(err => err);
  
      expect(error.toString()).toContain('AssertionError');
    });
  })

  describe('sendMessage', () => {
    it('expect to assert parameters', async () => {
      const error = await RelayService.sendMessage({
        recipientDid: null
      }).catch(err => err);
  
      expect(error.toString()).toContain('AssertionError');
    });
  })
});
