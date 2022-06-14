export class LoggerService {
  rpcMethods = {
    log: LoggerService.prototype.log,
    info: LoggerService.prototype.info,
    debug: LoggerService.prototype.debug,
  };

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
