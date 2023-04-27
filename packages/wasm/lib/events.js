import {EventEmitter} from 'events';

let emitter = new EventEmitter();

export function setRpcEventEmitter(e) {
  emitter = e;
}

export function getRpcEventEmitter() {
  return emitter;
}
