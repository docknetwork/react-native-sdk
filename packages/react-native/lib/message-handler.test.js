import {getRpcClient} from '@docknetwork/wallet-sdk-core/lib/rpc-client';
import {WebviewEventHandler} from './message-handler';
import rnRpcServer from './rn-rpc-server';

const testData = {test: true};

function createTestEvent(type, data = testData) {
  return {
    
    nativeEvent: {
      data: JSON.stringify({
        body: data,
        type,
      }),
    },
  };
}

describe('Message handler', () => {
  const webViewRef = {
    current: {
      injectJavaScript: jest.fn(),
    },
  };
  const onReady = jest.fn();
  let eventHandler: WebviewEventHandler;

  beforeAll(() => {
    eventHandler = new WebviewEventHandler({
      onReady,
      webViewRef,
    });

    jest.spyOn(eventHandler, '_handleRpcResponse');
    jest.spyOn(eventHandler, '_handleRpcRequest');
    jest.spyOn(eventHandler, '_handleRpcReady');
    jest.spyOn(eventHandler, '_handleLog');
    jest
      .spyOn(rnRpcServer, 'receive')
      .mockImplementation(data => Promise.resolve(data));
    jest
      .spyOn(getRpcClient(), 'receive')
      .mockImplementation(data => Promise.resolve(data));
  });

  it('expect to create message handler', () => {
    expect(eventHandler.webViewRef).toBe(webViewRef);
    expect(eventHandler.onReady).toBe(onReady);
  });

  it('expect to handle json-rpc-ready event', async () => {
    const event = createTestEvent('json-rpc-ready');

    await eventHandler.handleEvent(event);

    expect(eventHandler._handleRpcReady).toBeCalled();
    expect(onReady).toBeCalled();
  });

  it('expect to handle json-rpc-response event', async () => {
    const event = createTestEvent('json-rpc-response');
    await eventHandler.handleEvent(event);
    expect(eventHandler._handleRpcResponse).toBeCalled();
  });

  // it('expect to handle json-rpc-request event', async () => {
  //   const event = createTestEvent('json-rpc-request');
  //   await eventHandler.handleEvent(event);
  //   expect(eventHandler._handleRpcRequest).toBeCalled();
  //   expect(rnRpcServer.receive).toBeCalled();
  // });

  // it('expect to handle log event', async () => {
  //   const event = createTestEvent('log');
  //   await eventHandler.handleEvent(event);
  //   expect(eventHandler._handleLog).toBeCalled();
  // });

  // it('expect to dispatchEvent to webview', async () => {
  //   const body = {test: true};
  //   await eventHandler._dispatchEvent('test', body);
  //   expect(webViewRef.current.injectJavaScript).toBeCalled();
  // });
});
