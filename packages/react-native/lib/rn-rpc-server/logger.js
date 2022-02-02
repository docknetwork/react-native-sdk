import assert from 'assert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {EventEmitter} from 'events';

export class LoggerService {
  rpcMethods = [
    LoggerService.prototype.log,
    LoggerService.prototype.info,
    LoggerService.prototype.debug,
  ];

  constructor() {
    this.name = 'logger';
  }

  log(...args): Promise<any> {
    console.log(...args);
  }

  info(...args): Promise<any> {
    console.log(...args);
  }

  debug(...args): Promise<any> {
    console.log(...args);
  }
}

export const loggerService: LoggerService = new LoggerService();
