const ConsoleTransport = {
  log: (message: string) => {
    console.log(message);
  },
  error: (message: string) => {
    console.error(message);
  },
  debug: (message: string) => {
    console.debug(message);
  },
  warn: (message: string) => {
    console.warn(message);
  },
};

// const TypeORMTransport = {};

export const logger = ConsoleTransport;

export const createLogger = (prefix: string) => {
  return {
    log: (message: string) => {
      logger.log(`[${prefix}] ${message}`);
    },
    error: (message: string) => {
      logger.error(`[${prefix}] ${message}`);
    },
    debug: (message: string) => {
      logger.debug(`[${prefix}] ${message}`);
    },
    warn: (message: string) => {
      logger.warn(`[${prefix}] ${message}`);
    },
  };
};
