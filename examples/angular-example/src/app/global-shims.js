if (typeof setImmediate === 'undefined') {
  window.setImmediate = function (fn) {
    return setTimeout(fn, 0);
  };
}

window.global = window; // Ensures global exists in browser

if (typeof require === 'undefined') {
  window.require = function (id) {
    if (id === 'winston') {
      // Return a winston-compatible console logger
      const logger = {
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console),
        debug: console.debug.bind(console),
        log: console.log.bind(console),
        verbose: console.log.bind(console),
        silly: console.log.bind(console),
      };

      return {
        ...logger,
        createLogger: () => logger,
        format: {
          simple: () => ({}),
          combine: (...args) => ({}),
          timestamp: () => ({}),
          json: () => ({}),
          colorize: () => ({}),
          printf: fn => ({}),
        },
        transports: {
          Console: function () {
            return {};
          },
          File: function () {
            return {};
          },
        },
      };
    }

    throw new Error(`Module '${id}' not found`);
  };
}
