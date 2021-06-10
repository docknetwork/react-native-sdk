import Keyring from '@polkadot/keyring';
import { mnemonicGenerate } from '@polkadot/util-crypto';
import dock from '@docknetwork/sdk';
import { DockService } from './services/dock';

const keyring = new Keyring();
const mnemonic = 'wife village evoke error day record quick donor awful pass arctic arctic';
// mnemonicGenerate(12);


const pair = keyring.addFromMnemonic(mnemonic, {
  name: 'test wallet',
});
const pairJson = pair.toJson('test');

dock.init({
  address: 'ws://127.0.0.1:9944',
  // address: 'wss://danforth-1.dock.io',
}).then(async (result) => {
  dock.setAccount(pair);
  // Test2:
  // 5EJsUaFxpm2XjDz3yX9JMkRE7D9phD45zFSwkUJVMvNMcXd1
  
  // Test
  // 5GNwpoq4A7YZsRyCnJknNJ9CgxFDBV9LuRtsqRHbHbNzCg7i
  
  // 5EJsUaFxpm2XjDz3yX9JMkRE7D9phD45zFSwkUJVMvNMcXd1
  const account = await dock.api.query.system.account('5GNwpoq4A7YZsRyCnJknNJ9CgxFDBV9LuRtsqRHbHbNzCg7i');
  console.log(account.data.toJSON());
  
  debugger;
  
  const dripAmount = 1000;
  const address = '5EJsUaFxpm2XjDz3yX9JMkRE7D9phD45zFSwkUJVMvNMcXd1';

  try {
  const unsub = await dock.api.tx.balances.transfer('5EJsUaFxpm2XjDz3yX9JMkRE7D9phD45zFSwkUJVMvNMcXd1', dripAmount)
    .signAndSend(dock.account, (result) => {
      const { status } = result;
  
      console.log(status.toJSON());
      if (status.isInBlock) {
        // Request is successfully processed, remove address from queue.
        // dripRequests.delete(address);
        console.log(`Gave ${dripAmount} tokens to`, address);
        // res.json({
        //   address,
        //   hash: `${result.status.asInBlock}`,
        //   status: 'in block',
        // });
        unsub();
        // Process next request
        // handleDripRequest();
      } else if (status.isInvalid) {
        // throw new Error('Transaction status is invalid');
      } else if (status.isDropped) {
        throw new Error('Transaction status is dropped');
      } else if (status.isRetracted) {
        throw new Error('Transaction status is retracted');
      }
    });
  } catch(err) {
    
    debugger;
  }
    
  // console.log('test', account.data.free.toHuman());
});

console.log({
  mnemonic,
  keyring,
  pairJson
});

