import Keyring, {KeyringPair} from '@polkadot/keyring';
import {cryptoWaitReady} from '@polkadot/util-crypto';

const phrase =
  'twenty fat wood hub lock cattle thought base lazy apology lyrics innocent';

const network = 'test';

const TESTNET_ADDR_PREFIX = 21;
const MAINNET_ADDR_PREFIX = 22;

const prfx = network === 'test' ? TESTNET_ADDR_PREFIX : MAINNET_ADDR_PREFIX;

describe('KeyringService', () => {
  let keyring: Keyring;

  beforeAll(async () => {
    await cryptoWaitReady();
    keyring = new Keyring({
      ss58Format: prfx,
    });
  });

  it('Create pair, Schnorrkel: sr25519', () => {
    const type = 'sr25519';
    const derivePath = '';

    const pair: KeyringPair = keyring.createFromUri(
      `${phrase.trim()}${derivePath}`,
      {},
      type,
    );
    expect(pair.address).toBe(
      '393NFT43eUgKnEthAaKXnuCzizuxExMYULWrsjep5c1TmV4X',
    );
  });

  it('Create pair, Edwards: ed25519', () => {
    const type = 'ed25519';
    const pair = keyring.addFromMnemonic(phrase, {}, type);
    expect(pair.address).toBe(
      '37DhmhmagugS2pUDVx618ojLpp6mjTjmB9wxPjLkwiudmBvc',
    );
  });

  it('Create pair, ECDSA', () => {
    const type = 'ecdsa';
    const pair = keyring.addFromMnemonic(phrase, {}, type);
    expect(pair.address).toBe(
      '39W9ykjfE5bx3c8GCqEheX8DeC8tN9qReKKQaNqkgUpZ2QKo',
    );
  });
});
