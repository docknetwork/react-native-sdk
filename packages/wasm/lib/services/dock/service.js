import dock from '@docknetwork/sdk';
import {
  DockResolver,
  DIDKeyResolver,
  MultiResolver,
  UniversalResolver,
} from '@docknetwork/sdk/resolver';
import {initializeWasm} from '@docknetwork/crypto-wasm-ts'
import {EventEmitter} from 'events';
import {Logger} from '../../core/logger';
import {once} from '../../modules/event-manager';
import {InitParams, validation} from './configs';

let dockInstance = dock;

export function getDock() {
  return dockInstance;
}

export function setDock(instance) {
  dockInstance = instance;
}

// Create a resolver in order to lookup DIDs for verifying
export const universalResolverUrl = 'https://uniresolver.io';

class WalletSDKResolver extends MultiResolver {
  async resolve(did) {
    const trimmedDID = did.split('#')[0];
    const document = await super.resolve(trimmedDID);
    return document;
  }
}

/**
 *
 */
export class DockService {
  isDockReady = false;
  static Events = {
    DOCK_READY: 'dock-ready',
  };

  rpcMethods = [
    DockService.prototype.disconnect,
    DockService.prototype.ensureDockReady,
    DockService.prototype.init,
    DockService.prototype.isApiConnected,
    DockService.prototype.getAddress,
  ];

  constructor() {
    this.name = 'dock';
    this.dock = dock;
    this.emitter = new EventEmitter();
    this.resolver = this.createDIDResolver();
  }

  /**
   *
   * @returns
   */
  async ensureDockReady() {
    if (this.isDockReady) {
      return;
    }

    return once(this.emitter, DockService.Events.DOCK_READY);
  }

  createDIDResolver() {
    return new WalletSDKResolver(
      {
        dock: new DockResolver(getDock()), // Prebuilt resolver
        key: new DIDKeyResolver(), // did:key resolution
      },
      new UniversalResolver(universalResolverUrl),
    );
  }
  /**
   *
   * @param {*} params
   * @returns
   */
  async init(params: InitParams) {
    validation.init(params);

    if (this.dock?.isConnected) {
      await this.dock.disconnect();
    }

    await getDock().init(params);

    this.address = params.address;

    Logger.info(`Attempt to initialized substrate at: ${params.address}`);

    this.resolver = this.createDIDResolver();

    await initializeWasm();

    Logger.debug(`Substrate initialized at: ${params.address}`);

    this._setDockReady(true);

    return true;
  }

  /**
   *
   * @returns
   */
  async disconnect() {
    const result = await this.dock.disconnect();
    this._setDockReady(false);
    return result;
  }

  async waitDockReady() {
    return new Promise(resolve => {
      if (this.isDockReady) {
        resolve();
      } else {
        this.emitter.once(DockService.Events.DOCK_READY, resolve);
      }
    });
  }

  /**
   *
   * @returns
   */
  async isApiConnected() {
    return this.isDockReady;
  }

  async getAddress() {
    return this.dock.address;
  }

  _setDockReady(isDockReady) {
    this.isDockReady = isDockReady;

    if (isDockReady) {
      this.emitter.emit(DockService.Events.DOCK_READY);
    }
  }
}

export const dockService: DockService = new DockService();
