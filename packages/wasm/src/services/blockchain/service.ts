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
import {DockAPI} from '@docknetwork/dock-blockchain-api';
import {
  DockCoreModules,
  DockDIDModule,
} from '@docknetwork/dock-blockchain-modules';
import {EventEmitter} from 'events';
import {Logger} from '../../core/logger';
import {once} from '../../modules/event-manager';
import {utilCryptoService} from '../util-crypto';
import {InitParams, validation} from './configs';


// Create a resolver in order to lookup DIDs for verifying
export const universalResolverUrl = 'https://uniresolver.io';

class AnyDIDResolver extends ResolverRouter {
  method = WILDCARD;
}

/**
 *
 */
export class BlockchainService {
  dock;
  modules;
  didModule;
  cheqdApi;
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
    this.dock = new DockAPI();
    this.cheqdApi = new CheqdAPI();
    this.didModule = new DockDIDModule(this.dock);
    this.dockModules = new DockCoreModules(this.dock);
    this.cheqdModules = new CheqdCoreModules(this.cheqdApi);
    this.modules = new MultiApiCoreModules([this.dockModules]);
    this.emitter = new EventEmitter();
    this.resolver = this.createDIDResolver();
  }

  /**
   *
   * @returns
   */
  async ensureBlockchainReady() {
    if (this.isBlockchainReady) {
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
    validation.init(params);

    if (this.dock.isConnected) {
      await this.dock.disconnect();
    }

    if (this.cheqdApi && this.cheqdApi.isInitialized()) {
      await this.cheqdApi.disconnect();
    }

    Logger.info(`Attempt to initialized substrate at: ${params.address}`);

    await this.dock.init(params);

    Logger.info(`Substrate initialized at: ${params.address}`);

    if (params?.cheqdApiUrl) {
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
      } catch (err) {
        Logger.error(`Failed to initialize cheqd at: ${checkdApiUrl}`);
      }

      Logger.info(`Cheqd initialized at: ${checkdApiUrl}`);
    }

    this.address = params.address;

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
    const result = await this.dock.disconnect();
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
    return this.isBlockchainReady;
  }

  async getAddress() {
    return this.dock.address;
  }

  _setBlockchainReady(isBlockchainReady) {
    this.isBlockchainReady = isBlockchainReady;

    if (isBlockchainReady) {
      this.emitter.emit(BlockchainService.Events.BLOCKCHAIN_READY);
    }
  }
}

export const blockchainService: BlockchainService = new BlockchainService();
