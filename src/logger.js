

let logger = {
  log: (...args) => {},
};

export function setLogger(l) {
  logger = l;
}

export function getLogger() {
  return logger;
}
