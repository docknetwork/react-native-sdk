import {EventEmitter } from 'events';
import assert from 'assert';

export function once(emitter: EventEmitter, eventName: string) {
  return new Promise((resolve) => emitter.once(eventName, resolve));
}
export class EventManager {
  eventEmitter: EventEmitter;
  eventNames: string[];

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.eventNames = [];
  }

  registerEvent(eventName) {
    if (this.getEventByName(eventName)) {
      throw new Error('Event already exists');
    }

    this.eventNames.push(eventName);
  }

  registerEvents(eventsObject) {
    Object.keys(eventsObject).forEach(key =>
      this.registerEvent(eventsObject[key]),
    );
  }

  getEventByName(eventName: string) {
    assert(!!eventName, 'eventName is required');

    return this.eventNames.find(e => e === eventName);
  }

  assertEvent(eventName) {
    assert(
      this.getEventByName(eventName),
      `Event with name "${eventName}" not found`,
    );
  }

  emit(eventName: string, payload?: any) {
    this.assertEvent(eventName);
    console.log('Emit event', eventName);
    this.eventEmitter.emit(eventName, payload);
    return this;
  }

  removeListener(eventName, callback) {
    this.assertEvent(eventName);
    this.eventEmitter.removeListener(eventName, callback);
    return this;
  }

  addEventListener(eventName, callback) {
    return this.on(eventName, callback);
  }

  on(eventName, callback) {
    console.log(eventName);

    assert(!!callback, 'callback is required');
    this.assertEvent(eventName);
    this.eventEmitter.on(eventName, callback);
    return this;
  }

  waitFor(eventName) {
    this.assertEvent(eventName);
    return once(this.eventEmitter, eventName);
  }
}
