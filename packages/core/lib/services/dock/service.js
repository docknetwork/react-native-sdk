import dock, {DockAPI} from '@docknetwork/sdk';
import {EventEmitter} from 'events';
import {Logger} from '../../core/logger';
import {once} from '../../modules/event-manager';
import {InitParams, validation} from './configs';

export function getDock() {
  return dock;
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
    this.dock = new DockAPI();
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

    if (this.connectionInProgress) {
      console.warn('There is an exisiting connection');
      return this.connectionInProgress;
    }

    this.connectionInProgress = dock.init(params).finally(() => {
      // this.connectionInProgress = false;
    });

    Logger.info(`Attempt to initialized substrate at: ${params.address}`);

    const result = await this.connectionInProgress;

    Logger.debug(`Substrate initialized at: ${params.address}`);

    this._setDockReady(true);

    return result;
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
