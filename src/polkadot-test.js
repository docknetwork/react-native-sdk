import Keyring from '@polkadot/keyring';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import dock from '@docknetwork/sdk';

const keyring = new Keyring();
const mnemonic = mnemonicGenerate(12);
const pair = keyring.addFromMnemonic(mnemonic, {
  name: 'test wallet',
});
const pairJson = pair.toJson('test');

dock.init({
  address: 'wss://danforth-1.dock.io',
}).then((result) => {
  debugger;
});

console.log({
  mnemonic,
  keyring,
  pairJson
});

