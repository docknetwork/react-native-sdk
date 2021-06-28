import { getWallet } from "../services/wallet";
import { WalletRpc } from "./wallet-rpc";

const mnemonicEntity1 = {
  "@context": ["https://w3id.org/wallet/v1"],
  id: "urn:uuid:c410e44a-9525-11ea-bb37-0242ac130002",
  name: "Account 1",
  type: "Mnemonic",
  value:
    "humble piece toy mimic miss hurdle smile awkward patch drama hurry mixture",
};

const mnemonicEntity2 = {
  "@context": ["https://w3id.org/wallet/v1"],
  id: "urn:uuid:c410e44a-9525-11ea-bb37-0242ac133333",
  name: "Account 2",
  type: "Mnemonic",
  value:
    "humble piece toy mimic miss hurdle smile awkward patch drama hurry mixture",
};

const accountEntity = {
  "@context": [
    "https://w3id.org/wallet/v1"
  ],
  "id": "0x774477c4cd54718d32d4df393415796b9bfcb63c",
  "type": "Account",
  "name": "cocomelon",
}

// localStorage.setItem('dockWallet', JSON.stringify({"doc:f99e487c-df70-4da5-9eee-54ad7ae8e063":{"@context":["https://w3id.org/wallet/v1"],"id":"0x774477c4cd54718d32d4df393415796b9bfcb63c","type":"Account","name":"cocomelon","balance":{"value":0,"symbol":"DOCK"}},"doc:e1f58d89-b386-4cf6-9588-39bc9552f3f9":{"@context":["https://w3id.org/wallet/v1"],"id":"0x774477c4cd54718d32d4df393415796b9bfcb63c","type":"Account","name":"cocomelon","balance":{"value":0,"symbol":"DOCK"}}}));


describe("WalletRpc", () => {
  it("create", async () => {
    const walletId = "dockWallet";
    const result = await WalletRpc.create(walletId);
    expect(result).toBe(walletId);
  });

  it("load", async () => {
    const result = await WalletRpc.load();
    expect(result).toBe(null);
  });

  it("status", async () => {
    const status = await WalletRpc.status();
    expect(status).toBe("UNLOCKED");
  });

  it("add mnemonic", async () => {
    const result = await WalletRpc.add(mnemonicEntity1);
    await WalletRpc.add(mnemonicEntity2);

    expect(result).toBe(null);
  });
  
  it("add account", async () => {
    const result = await WalletRpc.add(accountEntity);
    expect(result).toBe(null);
  });
  
  it("get accounts", async () => {
    const result = await WalletRpc.query({
      equals: {
        'content.type': 'Account'
      }
    });
    
    expect(result.length).toBe(1);
    expect(result[0]).toBe(accountEntity);
    
  });

  it("getStorageDocument", async () => {
    let result = await WalletRpc.getStorageDocument({
      id: mnemonicEntity1.id,
    });
    expect(result.content).toBe(mnemonicEntity1);

    result = await WalletRpc.getStorageDocument({
      id: mnemonicEntity2.id,
    });
    expect(result.content).toBe(mnemonicEntity2);
  });
  
  it('remove', async () => {
    await WalletRpc.remove(mnemonicEntity1.id);
    
    let result;
    let error;
    try {
      result = await WalletRpc.getStorageDocument({
        id: mnemonicEntity1.id,
      });
    } catch(err) {
      error = true;
    }
    
    expect(error).toBe(true);
    expect(result).toBe(undefined);
    
  });

  // it("unlocked", async () => {
  //   await WalletRpc.lock('1234');
  //   const isUnlocked = await WalletRpc.Unlocked();
  //   expect(isUnlocked).toBe(true);
  // });
  // it("unlock", async () => {
  //   const result = await WalletRpc.unlocked();
  //   expect(result).toBe(false);
  // });

  it("toJSON", async () => {
    const result = await WalletRpc.toJSON();
    expect(result.id).toBe("dockWallet");
    expect(result.status).toBe("UNLOCKED");
  });

  // it("export", async () => {
  //   const result = await WalletRpc.export('somepassword');
  //   expect(result).toBe(null);
  // });
});
