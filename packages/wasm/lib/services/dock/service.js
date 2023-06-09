import dock from '@docknetwork/sdk';
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
  ];

  constructor() {
    this.name = 'dock';
    this.dock = dock;
    this.emitter = new EventEmitter();
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

  /**
   *
   * @param {*} params
   * @returns
   */
  async init(params: InitParams) {
    validation.init(params);

    if (!this.connectionInProgress) {
      console.warn('There is an exisiting connection');
      this.connectionInProgress = getDock().init(params);
    }

    Logger.info(`Attempt to initialized substrate at: ${params.address}`);

    await this.connectionInProgress;

    Logger.debug(`Substrate initialized at: ${params.address}`);

    this._setDockReady(true);

    return true;
  }

  /**
   *
   * @returns
   */
  async disconnect() {
    const result = await getDock().disconnect();
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

  _setDockReady(isDockReady) {
    this.isDockReady = isDockReady;

    if (isDockReady) {
      this.emitter.emit(DockService.Events.DOCK_READY);
    }
  }
}

export const dockService: DockService = new DockService();
