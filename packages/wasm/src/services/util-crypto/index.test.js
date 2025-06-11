import {cryptoWaitReady} from '@polkadot/util-crypto';
import {assertRpcService} from '../test-utils';
import {validation} from './configs';
import {utilCryptoService as service} from './service';
import {UtilCryptoServiceRpc} from './service-rpc';

describe('UtilCryptoService', () => {
  it('ServiceRpc', () => {
    assertRpcService(UtilCryptoServiceRpc, service, validation);
  });

  describe('service', () => {
    beforeAll(async () => {
      await cryptoWaitReady();
    });

    it('mnemonicGenerate', () => {
      const result = service.mnemonicGenerate(12);
      expect(typeof result).toBe('string');
    });

    describe('isBase64', () => {
      it('expect to be base64', async () => {
        expect(await service.isBase64('dGVzdA==')).toBe(true);
      });

      it('expect to not be base64', async () => {
        expect(await service.isBase64('wrong value')).toBe(false);
        expect(await service.isBase64('Test')).toBe(false);
      });
    });
  });
});
