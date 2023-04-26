import {cryptoWaitReady} from '@polkadot/util-crypto';
import {assertRpcService, getPromiseError} from '../test-utils';
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

    it('isAddressValid', async () => {
      expect(
        await service.isAddressValid(
          '3HM9DYxHe5tAwh2cuErNHiLxSMDJhetxaVGCDTYXiwyuuHN6',
        ),
      ).toBe(true);

      expect(await service.isAddressValid('wrong value')).toBe(false);
    });

    describe('mnemonicValidate', () => {
      it('expect mnemonic to be valid', async () => {
        const phrase = await service.mnemonicGenerate(12);
        const isValid = await service.mnemonicValidate(phrase);

        expect(isValid).toBe(true);
      });

      it('expect mnemonic to be invalid', async () => {
        const isValid = await service.mnemonicValidate('invalid mnemonic');

        expect(isValid).toBe(false);
      });
    });

    describe('deriveValidate', () => {
      let phrase;

      beforeAll(async () => {
        phrase = await service.mnemonicGenerate(12);
      });

      it('expect derive path to be valid', async () => {
        const result = await service.deriveValidate(`${phrase}/stuff/stuff`);
        expect(result).toStrictEqual({});
      });

      it('expect derive path to not be valid', async () => {
        const error = await getPromiseError(() =>
          service.deriveValidate('wrong phrase'),
        );
        expect(error.message).toBe('invalid derive path');
      });

      it('expect derive path to have warning', async () => {
        const result = await service.deriveValidate(
          `${phrase}/stuff///pass/tst`,
        );

        expect(result.warning).toBe('slash password detected');
      });
    });

    describe('isBase64', () => {
      it('expect to be base64', async () => {
        expect(await service.isBase64('dGVzdA==')).toBe(true);
      });

      it('expect to not be base64', async () => {
        expect(await service.isBase64('wrong value')).toBe(false);
      });
    });
  });
});
