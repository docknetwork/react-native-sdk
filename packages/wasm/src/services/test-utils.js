import assert from 'assert';
import {NetworkManager} from '../modules/network-manager';
import {RpcService} from './rpc-service-client';

export const TEST_FEE_AMOUNT = 2.48;
export const API_MOCK_DISABLED = process.env.API_MOCK_DISABLED === 'true';
export const TEST_TRUST_REGISTRIES = {
  '0xc255301bad77eab2a86760a80dfac734d85f1378b95671b169e3a519aa7eadd2': {
    name: 'Github',
    convener: 'did:dock:5HcwutWUAwVmHamXUa4QVpqHtDtJZwktXitETNKVMq6TZSPk',
    govFramework:
      '0x68747470733a2f2f6170692d73746167696e672e646f636b2e696f2f74727573742d726567697374726965732f3078633235353330316261643737656162326138363736306138306466616337333464383566313337386239353637316231363965336135313961613765616464322f7075626c6963',
  },
};
export const TEST_SCHEMA_METADATA = {
  '0x719455878946440f05937aba69d20a84ef32a2e254a03be324d72bf81d37d19b': {
    verifiers: [],
  },
};

let walletCreated;

export async function setupTestWallet() {
  if (walletCreated) {
    return;
  }

  NetworkManager.getInstance().setNetworkId('testnet');

  walletCreated = true;
}

export async function getPromiseError(func) {
  try {
    return await func();
  } catch (err) {
    return err;
  }
}

export function assertRpcService(
  ServiceClass: RpcService,
  service: any,
  validation: any,
) {
  assert(!!ServiceClass.prototype.call, 'must extend RpcServie class');

  const rpcService = new ServiceClass();
  const validationTmp = {};

  assert(rpcService.serviceName === service.name, 'service name mismatch');

  Object.keys(validation).forEach(key => {
    validationTmp[key] = validation[key];
    validation[key] = () => true;
  });

  service.rpcMethods.forEach(method => {
    const methodName = method.name;
    assert(
      !!rpcService[methodName],
      `[${methodName}]: not found in the rpc client`,
    );

    rpcService.call = jest.fn();
    rpcService[methodName]();

    const methodArg = rpcService.call.mock.calls[0][0];

    assert(
      methodArg === methodName,
      `[${methodName}]: rpc call method with wrong value "${methodArg}"`,
    );
  });

  Object.keys(validation).forEach(key => {
    validation[key] = validationTmp[key];
  });
}
