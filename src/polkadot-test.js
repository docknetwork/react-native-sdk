import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

const key = Buffer.from('776fe87eec8c9ba8417beda00b23cf22f5e134d9644d0a195cd9e0b7373760c1', 'hex');
const iv = crypto.randomBytes(16);

function encrypt(text) {
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {iv: iv.toString('hex'), encryptedData: encrypted.toString('hex')};
}

function decrypt(text) {
  let iv = Buffer.from(text.iv, 'hex');
  let encryptedText = Buffer.from(text.encryptedData, 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}


function main() {
    // const data = encrypt('test');
    // const decrypted = decrypt(data);
}

main();
// import Keyring from '@polkadot/keyring';
// import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto';
// import dock from '@docknetwork/sdk';
// import { DockService } from './services/dock';

// const keyring = new Keyring();

// // const mnemonic = mnemonicGenerate(12);
// // 'wife village evoke error day record quick donor awful pass arctic arctic';
// const mnemonic =
//   "hole dog cross program hungry blue burst raccoon differ rookie pipe auction";

// cryptoWaitReady().then(async () => {  
//   console.log('trying to create connection');

//   await dock.init({
//     address: 'wss://knox-1.dock.io',
//   });

//   // const testAccount = keyring.addFromUri(`${mnemonic}`);

//   // window.testAccount = testAccount;
//   // window.dock = dock;

//   // dock.setAccount(testAccount);

//   console.log('connection ok');
//   // const data = dock.api.tx.balances.transfer('37GfhtNUJk1aJhXuGxNJsAGenteDBX3DTVAvuBZm49Kqc9wA', '10000');
//   // const fee = await data.paymentInfo(testAccount);

//   // window.data = fee;
  
//   // console.log(fee.partialFee.toString());
// });

// // const pair = keyring.addFromMnemonic(mnemonic, {
// //   name: 'test wallet',
// // });
// // const pairJson = pair.toJson('test');

// // dock.init({
// //   address: 'ws://127.0.0.1:9944',
// //   // address: 'wss://danforth-1.dock.io',
// // }).then(async (result) => {
// //   dock.setAccount(pair);
// //   // Test2:
// //   // 5EJsUaFxpm2XjDz3yX9JMkRE7D9phD45zFSwkUJVMvNMcXd1
  
// //   // Test
// //   // 5GNwpoq4A7YZsRyCnJknNJ9CgxFDBV9LuRtsqRHbHbNzCg7i
  
// //   // 5EJsUaFxpm2XjDz3yX9JMkRE7D9phD45zFSwkUJVMvNMcXd1
// //   const account = await dock.api.query.system.account('5GNwpoq4A7YZsRyCnJknNJ9CgxFDBV9LuRtsqRHbHbNzCg7i');
// //   console.log(account.data.toJSON());
  
// //   debugger;
  
// //   const dripAmount = 1000;
// //   const address = '5EJsUaFxpm2XjDz3yX9JMkRE7D9phD45zFSwkUJVMvNMcXd1';

// //   try {
// //   const unsub = await dock.api.tx.balances.transfer('5EJsUaFxpm2XjDz3yX9JMkRE7D9phD45zFSwkUJVMvNMcXd1', dripAmount)
// //     .signAndSend(dock.account, (result) => {
// //       const { status } = result;
  
// //       console.log(status.toJSON());
// //       if (status.isInBlock) {
// //         // Request is successfully processed, remove address from queue.
// //         // dripRequests.delete(address);
// //         console.log(`Gave ${dripAmount} tokens to`, address);
// //         // res.json({
// //         //   address,
// //         //   hash: `${result.status.asInBlock}`,
// //         //   status: 'in block',
// //         // });
// //         unsub();
// //         // Process next request
// //         // handleDripRequest();
// //       } else if (status.isInvalid) {
// //         // throw new Error('Transaction status is invalid');
// //       } else if (status.isDropped) {
// //         throw new Error('Transaction status is dropped');
// //       } else if (status.isRetracted) {
// //         throw new Error('Transaction status is retracted');
// //       }
// //     });
// //   } catch(err) {
    
// //     debugger;
// //   }
    
// //   // console.log('test', account.data.free.toHuman());
// // });

// // console.log({
// //   mnemonic,
// //   keyring,
// //   pairJson
// // });

