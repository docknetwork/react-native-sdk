import {ExampleService, exampleService as service} from './service';
import {ExampleServiceRpc} from './service-rpc';
import {NetworkManager} from '../../modules/network-manager';
import {
  assertRpcService,
  getPromiseError,
  mockDockSdkConnection,
} from '../test-utils';
import {validation} from './configs';

describe('ExampleService', () => {
  it('ServiceRpc', () => {
    assertRpcService(ExampleServiceRpc, service, validation);
  });

  describe('service', () => {
    beforeAll(async () => {});

    describe('sum', () => {
      it('expect to sum numbers', async () => {
        const result = await service.sum({number1: 1, number2: 1});
        expect(result).toBe(2);
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() =>
          service.sum({number1: null, number2: 1}),
        );
        expect(error.message).toBe('invalid number1');
      });
    });
  });
});
