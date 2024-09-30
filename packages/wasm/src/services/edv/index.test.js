import {assertRpcService} from '../test-utils';
import {validation} from './configs';
import {edvService as service} from './service';
import {EDVServiceRpc} from './service-rpc';

describe('EDVService', () => {
  it('ServiceRpc', () => {
    assertRpcService(EDVServiceRpc, service, validation);
  });

  describe('service', () => {
    beforeAll(async () => {});

    describe('generateKeys', () => {
      it('should generate EDV keys', async () => {
        const keys = await service.generateKeys();

        expect(keys.agreementKey).toBeDefined();
        expect(keys.hmacKey).toBeDefined();
        expect(keys.verificationKey).toBeDefined();
      });
    });
  });
});
