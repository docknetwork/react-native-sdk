import {EventEmitter} from 'events';
import assert from 'assert';
import {Logger} from '../core/logger';

export function once(emitter: EventEmitter, eventName: string) {
  return new Promise(resolve => emitter.once(eventName, resolve));
}

// TODO: Drop this class and use EventEmitter directly
export class EventManager {
  eventEmitter: EventEmitter;
  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  emit(eventName: string, payload?: any) {
    Logger.debug(`Emit event: ${eventName}`);
    this.eventEmitter.emit(eventName, payload);
    return this;
  }

  removeListener(eventName, callback) {
    this.eventEmitter.removeListener(eventName, callback);
    return this;
  }

  addEventListener(eventName, callback) {
    return this.on(eventName, callback);
  }

  on(eventName, callback) {
    assert(!!callback, 'callback is required');
    this.eventEmitter.on(eventName, callback);
    return this;
  }

  waitFor(eventName) {
    return once(this.eventEmitter, eventName);
  }
}
