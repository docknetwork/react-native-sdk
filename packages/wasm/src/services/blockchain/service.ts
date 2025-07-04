// @ts-nocheck

import {DirectSecp256k1HdWallet} from '@cosmjs/proto-signing';
import {CheqdAPI} from '@docknetwork/cheqd-blockchain-api';
import {CheqdCoreModules} from '@docknetwork/cheqd-blockchain-modules';
import {MultiApiCoreModules} from '@docknetwork/credential-sdk/modules';
import {
  CoreResolver,
  DIDKeyResolver,
  ResolverRouter,
  UniversalResolver,
  WILDCARD,
} from '@docknetwork/credential-sdk/resolver';
import {initializeWasm} from '@docknetwork/crypto-wasm-ts/lib/index';
import {EventEmitter} from 'events';
import {Logger} from '../../core/logger';
import {once} from '../../modules/event-manager';
import {utilCryptoService} from '../util-crypto';
import {InitParams} from './configs';

export const universalResolverUrl = 'https://uniresolver.truvera.io';

import {
  AccumulatorCommon,
  AccumulatorId,
  AccumulatorPublicKey,
} from '@docknetwork/credential-sdk/types';

class AnyDIDResolver extends ResolverRouter {
  method = WILDCARD;
}

/**
 *
 */
export class BlockchainService {
  dock;
  modules;
  cheqdApi;
  cheqdApiUrl;
  isBlockchainReady = false;
  resolver: any;
  static Events = {
    BLOCKCHAIN_READY: 'blockchain-ready',
  };

  rpcMethods = [
    BlockchainService.prototype.disconnect,
    BlockchainService.prototype.ensureBlockchainReady,
    BlockchainService.prototype.init,
    BlockchainService.prototype.isApiConnected,
    BlockchainService.prototype.getAddress,
  ];

  constructor() {
    this.name = 'blockchain';
    this.cheqdApi = new CheqdAPI();
    this.cheqdModules = new CheqdCoreModules(this.cheqdApi);
    this.modules = new MultiApiCoreModules([this.cheqdModules]);
    this.emitter = new EventEmitter();
    this.resolver = this.createDIDResolver();
  }

  getTypesForDIDOrAccumulator(didOrRegistryId) {
    return {
        PublicKey: AccumulatorPublicKey,
        AccumulatorId,
        AccumulatorCommon,
        AccumulatorModule: this.modules.accumulator,
    }
  }

  /**
   *
   * @returns
   */
  async ensureBlockchainReady() {
    if (await this.isApiConnected()) {
      return;
    }

    return once(this.emitter, BlockchainService.Events.BLOCKCHAIN_READY);
  }

  createDIDResolver() {
    return new AnyDIDResolver([
      new DIDKeyResolver(),
      new CoreResolver(this.modules),
      new UniversalResolver(universalResolverUrl),
    ]);
  }
  /**
   *
   * @param {*} params
   * @returns
   */
  async init(params: InitParams) {
    if (!params?.cheqdApiUrl) {
      throw new Error('cheqdApiUrl is required');
    }

    if (this.cheqdApi && this.cheqdApi.isInitialized()) {
      Logger.info('Disconnecting from cheqd');
      await this.cheqdApi.disconnect();
    }

    this.modules = new MultiApiCoreModules([this.cheqdModules]);

    const checkdApiUrl = params?.cheqdApiUrl;
    const cheqdNetworkId = params?.networkId;
    const cheqdMnemonic =
      params?.cheqdMnemonic || (await utilCryptoService.mnemonicGenerate(12));

    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(cheqdMnemonic, {
      prefix: 'cheqd',
    });

    const walletAccounts = await wallet.getAccounts();
    const [{address}] = walletAccounts;
    console.log('Using cheqd account:', address);

    Logger.info(
      `Attempt to initialized cheqd at: ${checkdApiUrl} with networkId: ${cheqdNetworkId}`,
    );
    Logger.info(`Using cheqd account: ${address}`);

    try {
      await this.cheqdApi.init({
        wallet,
        url: checkdApiUrl,
        network: cheqdNetworkId,
      });
      Logger.info(`Cheqd initialized at: ${checkdApiUrl}`);
    } catch (err) {
      Logger.error(`Failed to initialize cheqd at: ${checkdApiUrl}`, err);
    }


    this.resolver = this.createDIDResolver();

    if (
      process.env.NODE_ENV !== 'test' ||
      process.env.API_MOCK_DISABLED === 'true'
    ) {
      await initializeWasm();
    }

    this._setBlockchainReady(true);

    return true;
  }

  /**
   *
   * @returns
   */
  async disconnect() {
    let result;

    if (this.cheqdApi && this.cheqdApi.isInitialized()) {
      result = await this.cheqdApi.disconnect();
    }

    this._setBlockchainReady(false);

    return result;
  }

  async waitBlockchainReady() {
    return new Promise(resolve => {
      if (this.isBlockchainReady) {
        resolve();
      } else {
        this.emitter.once(BlockchainService.Events.BLOCKCHAIN_READY, resolve);
      }
    });
  }

  /**
   *
   * @returns
   */
  async isApiConnected() {
    return this.cheqdApi.isInitialized();
  }

  async getAddress() {
    return this.cheqdApiUrl;
  }

  _setBlockchainReady(isBlockchainReady) {
    this.isBlockchainReady = isBlockchainReady;

    if (isBlockchainReady) {
      this.emitter.emit(BlockchainService.Events.BLOCKCHAIN_READY);
    }
  }
}

export const blockchainService: BlockchainService = new BlockchainService();
