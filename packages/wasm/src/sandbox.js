import {getRpcClient, initRpcClient} from './rpc-client';
import {setLogger} from './logger';
import rpcServer from './sandbox-rpc-server';

global.fetch = () => {
  throw new Error('fetch is not available in the sandbox');
};

global.XMLHttpRequest = () => {
  throw new Error('XMLHttpRequest is not available in the sandbox');
};

global.WebSocket = () => {
  throw new Error('WebSocket is not available in the sandbox');
};

global.Worker = () => {
  throw new Error('Worker is not available in the sandbox');
};

global.ServiceWorker = () => {
  throw new Error('ServiceWorker is not available in the sandbox');
};

global.XMLHttpRequestEventTarget = () => {
  throw new Error('XMLHttpRequestEventTarget is not available in the sandbox');
};

global.SharedWorker = () => {
  throw new Error('SharedWorker is not available in the sandbox');
};

global.WebSocketEventTarget = () => {
  throw new Error('WebSocketEventTarget is not available in the sandbox');
};

initRpcClient(jsonRPCRequest => {
  postMessage({
    type: 'json-rpc-request',
    body: jsonRPCRequest,
  });

  return Promise.resolve(jsonRPCRequest);
});

const postMessage = message => {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    console.log(message);
  }
};

const addEventListener = (...args) =>
  (navigator.appVersion.includes('Android')
    ? document
    : window
  ).addEventListener(...args);

setLogger({
  log: (...params) => {
    // Logger disabled for sandbox
  },
  debug: (...params) => {
    // Logger disabled for sandbox
  },
});

global.handleEvent = event => {
  const data = event.data;

  if (data && data.type === 'json-rpc-request') {
    rpcServer.receive(data.body).then(response => {
      postMessage({
        type: 'json-rpc-response',
        body: response,
      });
    });
  }

  if (data && data.type === 'json-rpc-response') {
    getRpcClient().receive(data.body);
  }

  // Handle health check pings
  if (data && data.type === 'health-check-ping') {
    postMessage({
      type: 'health-check-pong',
      body: { 
        id: data.body.id, 
        timestamp: Date.now(),
        status: 'healthy'
      }
    });
  }
};

addEventListener('message', global.handleEvent);

postMessage({
  type: 'json-rpc-ready',
});
