import { driver } from 'did-method-key';
import { DidKeyManager } from '../did.methods/did.key.manager';

it('can create did:key', async ()=>{
  await DidKeyManager.getInstance().createDID()
  expect(driver().generate.mock.calls.length).toBe(1);
});

it('can resolve did:key', async ()=>{
  await DidKeyManager.getInstance().resolveDID('did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH')
  expect(driver().get.mock.calls.length).toBe(1);
});

it('can save did:key', async ()=>{
  const didKeyManager = DidKeyManager.getInstance();

  const res = didKeyManager.saveDID('did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH')
  expect(didKeyManager.getWallet().add.mock.calls.length).toBe(1);
  expect(res).toBeTruthy();
});

