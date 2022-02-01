import {PolkadotService, polkadotService as service} from './service';
import {PolkadotServiceRpc} from './service-rpc';
import {NetworkManager} from '../../modules/network-manager';
import {
  assertRpcService,
  getPromiseError,
  mockDockSdkConnection,
} from '../test-utils';
import {validation} from './configs';
import {TestFixtures} from '../../fixtures';

describe('PolkadotService', () => {
  it('ServiceRpc', () => {
    assertRpcService(PolkadotServiceRpc, service, validation);
  });

  describe('service', () => {
    beforeAll(async () => {});

    describe('getAddressSvg', () => {
      it('expect to getAddressSvg', async () => {
        const result = await service.getAddressSvg({
          address: TestFixtures.account1.address,
        });
        expect(result).toEqual([
          {cx: 32, cy: 32, fill: '#eee', r: 32},
          {cx: 32, cy: 8, fill: 'hsl(118, 63%, 53%)', r: 5},
          {cx: 32, cy: 20, fill: 'hsl(348, 63%, 35%)', r: 5},
          {cx: 21.607695154586736, cy: 14, fill: 'hsl(225, 63%, 35%)', r: 5},
          {cx: 11.215390309173472, cy: 20, fill: 'hsl(11, 63%, 75%)', r: 5},
          {cx: 21.607695154586736, cy: 26, fill: 'hsl(264, 63%, 15%)', r: 5},
          {cx: 11.215390309173472, cy: 32, fill: 'hsl(56, 63%, 15%)', r: 5},
          {cx: 11.215390309173472, cy: 44, fill: 'hsl(95, 63%, 75%)', r: 5},
          {cx: 21.607695154586736, cy: 38, fill: 'hsl(163, 63%, 75%)', r: 5},
          {cx: 21.607695154586736, cy: 50, fill: 'hsl(33, 63%, 53%)', r: 5},
          {cx: 32, cy: 56, fill: 'hsl(213, 63%, 75%)', r: 5},
          {cx: 32, cy: 44, fill: 'hsl(281, 63%, 15%)', r: 5},
          {cx: 42.392304845413264, cy: 50, fill: 'hsl(33, 63%, 53%)', r: 5},
          {cx: 52.78460969082653, cy: 44, fill: 'hsl(95, 63%, 75%)', r: 5},
          {cx: 42.392304845413264, cy: 38, fill: 'hsl(163, 63%, 75%)', r: 5},
          {cx: 52.78460969082653, cy: 32, fill: 'hsl(56, 63%, 15%)', r: 5},
          {cx: 52.78460969082653, cy: 20, fill: 'hsl(11, 63%, 75%)', r: 5},
          {cx: 42.392304845413264, cy: 26, fill: 'hsl(264, 63%, 15%)', r: 5},
          {cx: 42.392304845413264, cy: 14, fill: 'hsl(225, 63%, 35%)', r: 5},
          {cx: 32, cy: 32, fill: 'hsl(39, 63%, 15%)', r: 5},
        ]);
      });

      it('expect to validate params', async () => {
        const error = await getPromiseError(() =>
          service.getAddressSvg({address: undefined}),
        );
        expect(error.message).toBe('invalid address: undefined');
      });
    });
  });
});
