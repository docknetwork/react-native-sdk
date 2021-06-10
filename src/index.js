import rpcServer from "./rpc-server";

import './polkadot-test';

const postMessage = (message) =>
  window.ReactNativeWebView
    ? window.ReactNativeWebView.postMessage(JSON.stringify(message))
    : console.log("POST Message", message);

const addEventListener = (...args) =>
  (navigator.appVersion.includes("Android")
    ? document
    : window
  ).addEventListener(...args);

addEventListener("message", (event) => {
  const data = event.data;

  if (data && data.type === "json-rpc-request") {
    rpcServer.receive(data.body).then((response) => {
      postMessage({
        type: "json-rpc-response",
        body: response,
      });
    });
  }
});

postMessage({
  type: "json-rpc-ready",
});
