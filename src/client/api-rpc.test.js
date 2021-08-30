import { cryptoWaitReady } from "@polkadot/util-crypto";
import { ApiRpc } from "./api-rpc";
import { DockRpc } from "./dock-rpc";

describe("ApiRpc", () => {
  beforeAll(cryptoWaitReady);

  it("getAccountBalance", async () => {
    const result = await ApiRpc.getAccountBalance();
    expect(result).toBeDefined();
  });
});
