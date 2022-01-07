const importWalletData = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/wallet/v1",
  ],
  id: "did:key:z6LSkXF4Bkn4Xf8cwqEDnGD5FsLgPUDEp9MEDEzeS1REiw4C#encrypted-wallet",
  type: ["VerifiableCredential", "EncryptedWallet"],
  issuer: "did:key:z6LSkXF4Bkn4Xf8cwqEDnGD5FsLgPUDEp9MEDEzeS1REiw4C",
  issuanceDate: "2022-01-05T14:14:43.031Z",
  credentialSubject: {
    id: "did:key:z6LSkXF4Bkn4Xf8cwqEDnGD5FsLgPUDEp9MEDEzeS1REiw4C",
    encryptedWalletContents: {
      protected: "eyJlbmMiOiJYQzIwUCJ9",
      recipients: [
        {
          header: {
            kid: "did:key:z6LSkXF4Bkn4Xf8cwqEDnGD5FsLgPUDEp9MEDEzeS1REiw4C#z6LSkXF4Bkn4Xf8cwqEDnGD5FsLgPUDEp9MEDEzeS1REiw4C",
            alg: "ECDH-ES+A256KW",
            epk: {
              kty: "OKP",
              crv: "X25519",
              x: "Ma0mK0Hcs_HCZNgkn5J_rQcSG0R1irFZrt0sQCSIUTo",
            },
            apu: "Ma0mK0Hcs_HCZNgkn5J_rQcSG0R1irFZrt0sQCSIUTo",
            apv: "ZGlkOmtleTp6NkxTa1hGNEJrbjRYZjhjd3FFRG5HRDVGc0xnUFVERXA5TUVERXplUzFSRWl3NEMjejZMU2tYRjRCa240WGY4Y3dxRURuR0Q1RnNMZ1BVREVwOU1FREV6ZVMxUkVpdzRD",
          },
          encrypted_key:
            "i6xrRWXo8BmSooM2c6HY9ishRUXJNoW3g2xnGXEeocKiamdzabPTlQ",
        },
      ],
      iv: "_A1ov_bwimDbNpQAEz6fc-mLwRaM7073",
      ciphertext: "9ZBlgByLhdKPnmV4FBJ-",
      tag: "VAEGfqbTbmUz1sRTqrICww",
    },
  },
};

import { cryptoWaitReady } from "@polkadot/util-crypto";
import WalletService, { getWallet } from "./wallet";

describe("UtilCryptoRpc", () => {
  beforeAll(async () => {
    await cryptoWaitReady();
  });
  it("expect to import wallet", async () => {
    await WalletService.routes.create("wallet", `memory`);
    await WalletService.routes.load();
    await WalletService.routes.sync();
    // await WalletService.routes.add({
    //   "@context": ["https://w3id.org/wallet/v1"],
    //   id: "test",
    //   type: "Account",
    //   correlation: ["1"],
    // });
    
    await WalletService.routes.importWallet(importWalletData, '!@9Mnemdm');

    console.log(getWallet().storageInterface);
  });
});
