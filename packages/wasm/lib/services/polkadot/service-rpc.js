import {RpcService} from '../rpc-service-client';
import {GetAddressSvgParams, validation} from './configs';

export class PolkadotServiceRpc extends RpcService {
  constructor() {
    super('polkadot');
  }

  getAddressSvg(params: GetAddressSvgParams): Promise<any> {
    validation.getAddressSvg(params);
    return this.call('getAddressSvg', params);
  }
}
