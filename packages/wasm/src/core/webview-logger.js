import Transport from 'winston-transport';

export class WebviewLoggerTransport extends Transport {
  postMessage = () => {};

  constructor({postMessage, ...opts}) {
    super(opts);

    this.postMessage = postMessage;
  }

  log(...params) {
    this.postMessage({
      type: 'log',
      body: JSON.stringify(params),
    });
  }

  debug(...params) {
    this.postMessage({
      type: 'log',
      body: JSON.stringify(params),
    });
  }

  info(...params) {
    this.postMessage({
      type: 'log',
      body: JSON.stringify(params),
    });
  }

  error(...params) {
    this.postMessage({
      type: 'log',
      body: JSON.stringify(params),
    });
  }
}
