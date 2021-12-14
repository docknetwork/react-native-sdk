import { EventEmitter, once } from 'events';


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
        Object.keys(eventsObject).forEach(key => this.registerEvent(eventsObject[key]));
    }

    getEventByName(eventName) {
        return this.eventNames.find(e => e === eventName);
    }

    checkEvent(eventName) {
        if (!this.getEventByName(eventName)) {
            throw new Error(`Event with name "${eventName}" not found`);
        }
    }

    emit(eventName, payload) {
        this.checkEvent(eventName);
        this.eventEmitter.emit(eventName, payload);
        return this;
    }

    removeListener(eventName, callback) {
        this.checkEvent(eventName);
        this.eventEmitter.removeListener(eventName, callback);
        return this;
    }

    on(eventName) {
        this.checkEvent(eventName);
        this.eventEmitter.on(eventName, payload);
        return this;
    }

    waitFor(eventName) {
        this.checkEvent(eventName);
        return once(this.emitter, eventName);
    }
}