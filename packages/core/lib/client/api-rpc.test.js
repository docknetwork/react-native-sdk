import service from '../services/api';
import {mockRpcClient, restoreRpcClient, testRpcEndpoint} from '../test-utils';
import {ApiRpc, TxInput} from './api-rpc';

describe('ApiRpc', () => {
  beforeEach(mockRpcClient);

  const txInput: TxInput = {
    amount: 1,
    fromAddress: 'from address',
    toAddress: 'to address',
  };

  describe('getAccountBalance', () => {
    it('expect to invoke server endpoint', () => {
      testRpcEndpoint(service, ApiRpc.getAccountBalance, 'address');
    });

    it('expect to validate params', () => {
      expect(() => ApiRpc.getAccountBalance(null)).toThrow();
    });
  });

  describe('getFeeAmount', () => {
    it('expect to invoke server endpoint', () => {
      testRpcEndpoint(service, ApiRpc.getFeeAmount, txInput);
    });

    it('expect to validate params', () => {
      expect(() => testRpcEndpoint(service, ApiRpc.getFeeAmount, {})).toThrow();
    });
  });

  describe('sendTokens', () => {
    it('expect to invoke server endpoint', () => {
      testRpcEndpoint(service, ApiRpc.sendTokens, txInput);
    });

    it('expect to validate params', () => {
      expect(() => testRpcEndpoint(service, ApiRpc.sendTokens, {})).toThrow();
    });
  });

  afterAll(restoreRpcClient);
});
