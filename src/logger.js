

let logger = {
  log: console.log,
};

export function setLogger(l) {
  logger = l;
}

export function getLogger() {
  return logger;
}
