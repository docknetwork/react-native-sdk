import rpcServer from './rpc-server';
import {getRpcClient, initRpcClient} from './rpc-client';
import {getLogger, setLogger} from './logger';

initRpcClient(jsonRPCRequest => {
  postMessage({
    type: 'json-rpc-request',
    body: jsonRPCRequest,
  });

  return Promise.resolve(jsonRPCRequest);
});

const postMessage = message =>
  window.ReactNativeWebView &&
  window.ReactNativeWebView.postMessage(JSON.stringify(message));

const addEventListener = (...args) =>
  (navigator.appVersion.includes('Android')
    ? document
    : window
  ).addEventListener(...args);

setLogger({
  log: (...params) => {
    postMessage({
      type: 'log',
      body: JSON.stringify(params),
    });
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
    getLogger().log('Received response', data.body);
    getRpcClient().receive(data.body);
  }
};

addEventListener('message', global.handleEvent);

postMessage({
  type: 'json-rpc-ready',
});
