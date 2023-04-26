import assert from 'assert';
import {
  getRpcClient,
  initRpcClient,
} from '@docknetwork/wallet-sdk-wasm/lib/rpc-client';

import {Logger} from '@docknetwork/wallet-sdk-wasm/lib/core/logger';
import rnRpcServer from './rn-rpc-server';

export class WebviewEventHandler {
  constructor({webViewRef, sandboxWebViewRef, onReady}) {
    assert(!!webViewRef, 'webViewRef is required');

    this.webViewRef = webViewRef;
    this.sandboxWebViewRef = sandboxWebViewRef;
    this.onReady = onReady;
  }

  getEventMapping() {
    return {
      'json-rpc-ready': this._handleRpcReady,
      'json-rpc-response': this._handleRpcResponse,
      'json-rpc-request': this._handleRpcRequest,
      log: this._handleLog,
    };
  }

  handleSandboxEvent(event) {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'json-rpc-ready') {
      return;
    }

    const handler = this.getEventMapping()[data.type];

    handler.apply(this, [data]);
  }

  handleEvent(event) {
    assert(!!event, 'event is required');
    const data = JSON.parse(event.nativeEvent.data);

    const handler = this.getEventMapping()[data.type];

    assert(!!handler, `handler not found for event ${data.type}`);

    handler.apply(this, [data]);
  }

  _dispatchEvent(type, body) {
    const isSandboxMessage = body?.method?.indexOf('sandbox-') === 0;
    const webview = isSandboxMessage
      ? this.sandboxWebViewRef.current
      : this.webViewRef.current;

    if (isSandboxMessage) {
      body.method = body.method.replace('sandbox-', '');
    }

    webview.injectJavaScript(`
      (function(){
        (navigator.appVersion.includes("Android") ? document : window).dispatchEvent(new MessageEvent('message', {data: ${JSON.stringify(
          {
            type: type,
            body: body,
          },
        )}}));
      })();`);
  }

  _handleRpcReady() {
    initRpcClient(async jsonRPCRequest => {
      this._dispatchEvent('json-rpc-request', jsonRPCRequest);
      return jsonRPCRequest;
    });

    if (this.onReady) {
      this.onReady();
    }
  }

  /**
   * Handle data sent back from the webview layer
   * Its a response for a json-rpc-request event
   *
   * @param {*} data
   */
  _handleRpcResponse(data) {
    // console.log('', data);
    getRpcClient().receive(data.body);
  }

  /**
   * Handles a json rpc request from the webview
   * The react native rpc servier will handle it and dispatch a response event
   * @param {*} data
   */
  _handleRpcRequest(data) {
    console.log('response rpc request', data);

    rnRpcServer.receive(data.body).then(response => {
      this._dispatchEvent('json-rpc-response', response);
      return response;
    });
  }

  _handleLog(data) {
    Logger.info(data.body);
  }
}
