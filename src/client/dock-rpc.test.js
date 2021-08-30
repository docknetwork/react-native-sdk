import { cryptoWaitReady } from "@polkadot/util-crypto";
import { DockRpc } from "./dock-rpc";

describe("DockRpc", () => {
  beforeAll(cryptoWaitReady);

  it("initialize", async () => {
    const result = await DockRpc.init({
      // address: "wss://knox-1.dock.io",
      address: "ws://127.0.0.1:9944",
    });
    expect(result).toBeDefined();
  });
});
