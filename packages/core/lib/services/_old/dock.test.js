import DockService from './dock';
import {NetworkManager} from '../modules/network-manager';
import {dock} from './dock';
import { getPromiseError, mockDockSdkConnection } from './test-utils';

const doConnect = (address = NetworkManager.getInstance().getNetworkInfo().substrateUrl) =>
  DockService.routes.init({
    address,
  });

describe('DockService', () => {
  describe('init', () => {
    afterEach(async () => {
      await DockService.routes.disconnect();
    });

    it('connect and disconnect substrate node', async () => {
      const mock = mockDockSdkConnection();
      const result = await doConnect();

      expect(result).toBe(mock.result);
      expect(await DockService.routes.isApiConnected()).toBeTruthy();

      await DockService.routes.disconnect();

      expect(await DockService.routes.isApiConnected()).toBeFalsy();
      mock.clear();
    });

    it('throw error for invalid address', async () => {
      const mock = mockDockSdkConnection();
      const error = await getPromiseError(async () => {
        await doConnect(null);
      });

      expect(error.message).toBe('invalid substrate address');
      expect(await DockService.routes.isApiConnected()).toBeFalsy();

      mock.clear();
    });

    it('throw error for existing connection', async () => {
      const mock = mockDockSdkConnection();
      const error = await getPromiseError(async () => {
        await doConnect();
        await doConnect();
      });

      expect(error.message).toBe('dock is already initialized');

      mock.clear();
    });
    
    it('throw error if connectino in progress', async () => {
      const mock = mockDockSdkConnection();
      const error = await getPromiseError(async () => {
        doConnect();
        await doConnect();
      });
      
      expect(error.message).toBe('there is a connection in progress')

      mock.clear();
    });
  });
});
