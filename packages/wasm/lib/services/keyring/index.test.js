import {mnemonicGenerate} from '@polkadot/util-crypto';
import {NetworkManager} from '../../modules/network-manager';
import {assertRpcService, getPromiseError} from '../test-utils';
import {validation} from './configs';
import {keyringService as service} from './service';
import {KeyringServiceRpc} from './service-rpc';

describe('KeyringService', () => {
  it('ServiceRpc', () => {
    assertRpcService(KeyringServiceRpc, service, validation);
  });

  describe('service', () => {
    beforeAll(async () => {});

    describe('initialize', () => {
      it('expect to initialize keyring', async () => {
        await service.initialize({
          ss58Format:
            NetworkManager.getInstance().getNetworkInfo().addressPrefix,
        });

        expect(service.keyring).toBeDefined();
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() => service.initialize({}));
        expect(error.message).toBe('invalid ss58Format');
      });
    });

    describe('addFromMnemonic', () => {
      it('expect to add keypair from mnemonic', async () => {
        await service.addFromMnemonic({
          mnemonic: mnemonicGenerate(12),
        });

        expect(service.keyring).toBeDefined();
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() => service.addFromMnemonic({}));

        expect(error.message).toBe('invalid mnemonic');
      });
    });
  });
});
