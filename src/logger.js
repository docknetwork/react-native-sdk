

let logger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== 'test') {
      console.log(...args);
    }
  },
};

export function setLogger(l) {
  logger = l;
}

export function getLogger() {
  return logger;
}
