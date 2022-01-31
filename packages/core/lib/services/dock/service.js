import assert from 'assert';
import {EventEmitter, once} from 'events';
import {DockAPI} from '@docknetwork/sdk';
import {validation, InitParams} from './configs';
import { Logger } from '../../core/logger';

/**
 * 
 */
export class DockService {

  isDockReady = false;
  static Events = {
    DOCK_READY: 'dock-ready'
  }
  
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

    assert(!this.connectionInProgress, 'there is a connection in progress');
    assert(!this.isDockReady, 'dock is already initialized');
    
    this.connectionInProgress = true;

    Logger.debug(`Attempt to initialized substrate at: ${params.address}`);
    
    const result = await this.dock.init(params).finally(() => {
      this.connectionInProgress = false;
    });
    
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


export const dockService:DockService = new DockService();

