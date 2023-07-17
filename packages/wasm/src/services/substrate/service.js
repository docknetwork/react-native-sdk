import assert from 'assert';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';
import {DOCK_TOKEN_UNIT, getPlainDockAmount} from '../../core/format-utils';
import {dockService} from '../dock/service';
import {signAndSend} from './api-utils';
import {
  GetAccountBalanceParams,
  serviceName,
  TransactionParams,
  validation,
} from './configs';
import {keyringService} from '../keyring/service';

export const FEE_ESTIMATION_BUFFER = 1.1;

export function getFeeWithBuffer(paymentFee: BigNumber) {
  assert(!!paymentFee, 'paymentFee is required');

  return new BigNumber(paymentFee).multipliedBy(FEE_ESTIMATION_BUFFER);
}

export class SubstrateService {
  rpcMethods = [
    SubstrateService.prototype.getAccountBalance,
    SubstrateService.prototype.getFeeAmount,
    SubstrateService.prototype.sendTokens,
  ];

  constructor() {
    this.name = serviceName;
  }

  async getAccountBalance(params: GetAccountBalanceParams) {
    validation.getAccountBalance(params);

    await dockService.ensureDockReady();

    const {
      data: {free},
    } = await dockService.dock.api.query.system.account(params.address);

    return free.toNumber() / DOCK_TOKEN_UNIT;
  }

  async getFeeAmount(params: TransactionParams) {
    validation.getFeeAmount(params);

    const {toAddress, keyPair} = params;
    const amount = getPlainDockAmount(params.amount).toNumber();

    const account = keyringService.decryptKeyPair({
      jsonData: keyPair,
      password: '',
    });

    dockService.dock.setAccount(account);

    const extrinsic = dockService.dock.api.tx.balances.transfer(
      toAddress,
      amount,
    );
    const paymentInfo = await extrinsic.paymentInfo(account);
    const fee = getFeeWithBuffer(paymentInfo.partialFee)
      .dividedBy(DOCK_TOKEN_UNIT)
      .toNumber();

    return fee;
  }

  async sendTokens(params: TransactionParams) {
    validation.sendTokens(params);

    let {toAddress, fromAddress, keyPair} = params;
    let amount = getPlainDockAmount(params.amount).toNumber();
    const account = keyringService.decryptKeyPair({
      jsonData: keyPair,
      password: '',
    });
    const {dock} = dockService;

    dock.setAccount(account);

    if (params.transferAll) {
      const api = dock.api;
      const balances = await api.derive.balances.all(account.address);

      await api.tx.balances
        .transfer(fromAddress, balances.availableBalance)
        .paymentInfo(account)
        .then(async ({partialFee}): void => {
          const adjFee = getFeeWithBuffer(partialFee);
          let maxTransfer = balances.availableBalance.sub(
            new BN(adjFee.toNumber()),
          );

          if (!maxTransfer.gt(api.consts.balances.existentialDeposit)) {
            throw new Error('balance too low');
          }

          amount = maxTransfer;
        });
    }

    return new Promise((resolve, reject) => {
      const extrinsic = dock.api.tx.balances.transfer(toAddress, amount);

      signAndSend(account, extrinsic).on('done', resolve).on('error', reject);
    });
  }
}

export const substrateService: SubstrateService = new SubstrateService();
