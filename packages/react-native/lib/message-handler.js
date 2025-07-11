import assert from 'assert';
import {
  getRpcClient,
  initRpcClient,
} from '@docknetwork/wallet-sdk-wasm/src/rpc-client';

import {Logger} from '@docknetwork/wallet-sdk-wasm/src/core/logger';
import rnRpcServer from './rn-rpc-server';
import { WebViewHealthChecker } from './webview-health-checker';

export class WebviewEventHandler {
  constructor({webViewRef, sandboxWebViewRef, onReady}) {
    assert(!!webViewRef, 'webViewRef is required');

    this.webViewRef = webViewRef;
    this.sandboxWebViewRef = sandboxWebViewRef;
    this.onReady = onReady;
    
    // Initialize health checker
    this.healthChecker = new WebViewHealthChecker(this);
  }

  getEventMapping() {
    return {
      'json-rpc-ready': this._handleRpcReady,
      'json-rpc-response': this._handleRpcResponse,
      'json-rpc-request': this._handleRpcRequest,
      'health-check-pong': this._handleHealthPong,
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

  _handleHealthPong(data) {
    this.healthChecker.handlePong(data);
  }

  reloadWebViews() {
    this.webViewRef.current?.reload();
    this.sandboxWebViewRef.current?.reload();
  }

  setHealthStatus(isHealthy, reason) {
    this.healthChecker.setHealthStatus(isHealthy, reason);
  }

  startHealthCheck(config) {
    this.healthChecker.start(config);
  }

  stopHealthCheck() {
    this.healthChecker.stop();
  }

  pauseHealthCheck() {
    this.healthChecker.pause();
  }

  resumeHealthCheck() {
    this.healthChecker.resume();
  }
}
