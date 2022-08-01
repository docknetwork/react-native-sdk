import {cryptoWaitReady} from '@polkadot/util-crypto';
import assert from 'assert';
import BigNumber from 'bignumber.js';
import {DOCK_TOKEN_UNIT} from '../core/format-utils';
import {TestFixtures} from '../fixtures';
import {NetworkManager} from '../modules/network-manager';
import {dockService} from './dock/service';
import {keyringService} from './keyring';
import {RpcService} from './rpc-service-client';
import {walletService} from './wallet';

export async function initializeWalletService() {
  await cryptoWaitReady();
  await keyringService.initialize({
    ss58Format: 21,
  });
  await walletService.create('test-wallet', 'memory');
}

export const TEST_FEE_AMOUNT = 2.48;
export const API_MOCK_DISABLED = true;

let mockTransactionError;

export const setMockTransactionError = error => {
  mockTransactionError = error;
};

export async function mockDockService() {
  await cryptoWaitReady();

  await keyringService.initialize({
    ss58Format: NetworkManager.getInstance().getNetworkInfo().addressPrefix,
  });

  let sdkMock;

  if (API_MOCK_DISABLED) {
    return dockService.init({
      address: NetworkManager.getInstance().getNetworkInfo().substrateUrl,
    });
  } else {
    sdkMock = mockDockSdkConnection();
    await dockService.init({
      address: NetworkManager.getInstance().getNetworkInfo().substrateUrl,
    });
  }

  const _dockSdk = dockService.dock;

  dockService.isDockReady = true;

  dockService.dock = {
    api: {
      events: {
        system: {
          ExtrinsicFailed: {
            is: event => !!mockTransactionError,
          },
        },
      },
      query: {
        system: {
          account: jest.fn().mockImplementation(() => ({
            data: {
              free: BigNumber(TestFixtures.account1.balance * DOCK_TOKEN_UNIT),
            },
          })),
        },
      },
      tx: {
        balances: {
          transfer: jest.fn().mockImplementation(() => ({
            paymentInfo: () => ({
              partialFee: BigNumber(TEST_FEE_AMOUNT * DOCK_TOKEN_UNIT),
            }),
            signAndSend: (account, callback) => {
              callback({
                status: {
                  isInBlock: true,
                  isFinalized: true,
                  toHex: () => 'hash',
                },
                events: [
                  {
                    event: {
                      data: [mockTransactionError],
                    },
                  },
                ],
              });

              return Promise.resolve({});
            },
          })),
        },
      },
    },
    init: jest.fn().mockImplementation(() => Promise.resolve({})),
    disconnect: jest.fn(),
    setAccount: jest.fn(),
  };

  return () => {
    dockService.dock = _dockSdk;
    if (sdkMock) {
      sdkMock.clear();
    }
    dockService.disconnect();
  };
}

let walletCreated;

export async function setupTestWallet() {
  if (walletCreated) {
    return;
  }

  NetworkManager.getInstance().setNetworkId('testnet');

  await cryptoWaitReady();
  await keyringService.initialize({
    ss58Format: NetworkManager.getInstance().getNetworkInfo().addressPrefix,
  });
  await walletService.create({
    walletId: 'test-wallet',
    type: 'memory',
  });
  await walletService.createAccountDocuments({
    mnemonic: TestFixtures.account1.mnemonic,
    name: TestFixtures.account1.name,
  });
  await walletService.createAccountDocuments({
    mnemonic: TestFixtures.account2.mnemonic,
    name: TestFixtures.account2.name,
  });

  walletCreated = true;
}

export function mockDockSdkConnection(connectionError) {
  const result = 'result';

  const mocks = [
    jest.spyOn(dockService.dock, 'init').mockImplementation(() => {
      if (connectionError) {
        return Promise.reject(connectionError);
      }

      return Promise.resolve(result);
    }),
    jest
      .spyOn(dockService.dock, 'disconnect')
      .mockReturnValue(Promise.resolve(true)),
  ];

  return {
    result,
    clear: () => mocks.forEach(mock => mock.mockClear()),
  };
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
