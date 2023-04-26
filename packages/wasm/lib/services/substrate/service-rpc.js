import {RpcService} from '../rpc-service-client';
import {
  GetAccountBalanceParams,
  serviceName,
  TransactionParams,
} from './configs';

export class SubstrateServiceRpc extends RpcService {
  constructor() {
    super(serviceName);
  }

  getAccountBalance(params: GetAccountBalanceParams): Promise<any> {
    return this.call('getAccountBalance', params);
  }

  getFeeAmount(params: TransactionParams): Promise<any> {
    return this.call('getFeeAmount', params);
  }

  sendTokens(params: TransactionParams): Promise<any> {
    return this.call('sendTokens', params);
  }
}
