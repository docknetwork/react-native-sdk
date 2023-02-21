window.ReactNativeWebView = {
  postMessage: jest.fn(),
};

require('./sandbox');

describe('Sandbox', () => {
  it('expect to init RPC client', () => {
    expect(global.client).toBeTruthy();
  });

  it('expect to send json-rpc-ready message', () => {
    expect(window.ReactNativeWebView.postMessage).toBeCalledWith(
      JSON.stringify({
        type: 'json-rpc-ready',
      }),
    );
  });
});
