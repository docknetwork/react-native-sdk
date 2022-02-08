import {RpcService} from '../rpc-service-client';
import {getAddressSvg, validation} from './configs';

export class PolkadotServiceRpc extends RpcService {
  constructor() {
    super('polkadot');
  }

  getAddressSvg(params: getAddressSvg): Promise<any> {
    validation.getAddressSvg(params);
    return this.call('getAddressSvg', params);
  }
}
