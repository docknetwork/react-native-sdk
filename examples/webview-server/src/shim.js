import winston from 'winston';

if (typeof setImmediate === "undefined") {
  window.setImmediate = function (fn) {
    return setTimeout(fn, 0);
  };
}

global.require = function (module) {
  if (module === 'winston') {
    return winston;
  }

  return {

  }
}
