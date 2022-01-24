import {ApiRpc} from './client/api-rpc';
import {getRpcClient} from './rpc-client';
import {getRpcEventEmitter} from './events';

let request;

export function mockRpcClient() {
  request = getRpcClient().request;
  getRpcClient().request = jest.fn(() => Promise.resolve({}));
}

export function restoreRpcClient() {
  getRpcClient().request = request;
}

export function resolveServiceEndpoint(service, method) {
  return `${service.name}.${method.name}`;
}

export function testRpcEndpoint(service, rpcMethod) {
  const params = [];
  rpcMethod(...params);
  const endpoint = resolveServiceEndpoint(
    service,
    service.routes[rpcMethod.name],
  );

  expect(getRpcClient().request).toBeCalled();
  expect(getRpcClient().request.mock.calls[0][0]).toBe(endpoint);
}

export const waitFor = timeout => new Promise(res => setTimeout(res, timeout));

let sendTokensSpy;
let getFeeSpy;

export function mockTransaction({hash, error, delay = 300, fee}) {
  sendTokensSpy = jest.spyOn(ApiRpc, 'sendTokens').mockImplementation(() => {
    // Emit events
    setTimeout(() => {
      if (error) {
        getRpcEventEmitter().emit(`${hash}-failed`, error);
        return;
      }

      getRpcEventEmitter().emit(`${hash}-complete`);
    }, delay);

    return Promise.resolve(hash);
  });

  getFeeSpy = jest
    .spyOn(ApiRpc, 'getFeeAmount')
    .mockReturnValue(Promise.resolve(fee));
}

export function resetMockTransaction() {
  if (sendTokensSpy) {
    sendTokensSpy.mockRestore();
  }

  if (getFeeSpy) {
    getFeeSpy.mockRestore();
  }
}
