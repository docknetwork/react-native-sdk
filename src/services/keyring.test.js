import Keyring, { KeyringPair } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

const phrase =
  "scale hold evidence moment reward garbage spider sign admit omit mimic frame";

describe("KeyringService", () => {
  let keyring: Keyring;

  beforeAll(async () => {
    await cryptoWaitReady();
    keyring = new Keyring();
  });

  it("Create pair, Schnorrkel: sr25519", () => {
    const type = "sr25519";
    const derivePath = ''
    const pair: KeyringPair = keyring.createFromUri(`${phrase.trim()}${derivePath}`, {}, type)

    expect(pair.address).toBe("3Hw9kgeVr39oo9AaCC9T7GCt3N5DBzRzcw9f3fFjukLx6BBo");
  });

  // it("Create pair, Edwards: ed25519", () => {
  //   const type = "ed25519";
  //   const pair = keyring.addFromMnemonic(phrase, {}, type);
  //   expect(pair.address).toBe(
  //     "3Cudp4zNQTb4oEaB3Pyyu3wkQXAs6ta5LSkh7PcW7DEhkvSW"
  //   );
  // });

  // it("Create pair, ECDSA", () => {
  //   const type = "ecdsa";
  //   const pair = keyring.addFromMnemonic(phrase, {}, type);
  //   expect(pair.address).toBe(
  //     "3F61e6tjURzsvpXwADj5nKhC6yTtBGqXre3XA2nkNDHUadq4"
  //   );
  // });
});
