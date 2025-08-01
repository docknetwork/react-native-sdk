import {getRpcClient} from './rpc-client';

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

export function testRpcEndpoint(service, rpcMethod, ...params) {
  rpcMethod(...params);
  const endpoint = resolveServiceEndpoint(
    service,
    service.routes[rpcMethod.name],
  );

  expect(getRpcClient().request).toBeCalled();
  expect(getRpcClient().request.mock.calls[0][0]).toBe(endpoint);
}

export const waitFor = timeout => new Promise(res => setTimeout(res, timeout));
