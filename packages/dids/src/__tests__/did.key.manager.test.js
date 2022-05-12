import { driver } from 'did-method-key';
import { DidKeyManager } from '../did.methods/did.key.manager';

describe('DidKeyManager', ()=>{
  beforeEach(()=>{
    jest.restoreAllMocks()
  })
  it('can create did:key', async ()=>{
    const didKeyManager = DidKeyManager.getInstance();

    const spy = jest.spyOn(didKeyManager, 'saveDID').mockReturnValue({
      '@context': [],
      id: '',
      name: 'any',
      type: {},
      value: {  },
      correlation: [],
    });


    await didKeyManager.createDID()
    expect(driver().generate.mock.calls.length).toBe(1);
    expect(spy).toHaveBeenCalled();
  });



  it('can save did:key', async ()=>{
    const didKeyManager = DidKeyManager.getInstance();

    const didDocument = {
      "@context": ["https://w3id.org/wallet/v1"],
      "id": "did:example:123456789abcdefghi",
      "type": "Person",
      "name": "John Smith",
      "image": "https://via.placeholder.com/150",
      "description" : "Professional software developer for Acme Corp.",
      "tags": ["professional", "person"],
      "correlation": ["4058a72a-9523-11ea-bb37-0242ac130002"]
    }
    await didKeyManager.saveDID(didDocument)
    expect(didKeyManager.getWallet().add.mock.calls.length).toBe(1);
  });

  it('can fetch saved did:keys', async ()=>{
    const didKeyManager = DidKeyManager.getInstance();
    const res = await didKeyManager.getDIDs();
    expect(didKeyManager.getWallet().query.mock.calls.length).toBe(1);
    expect(res[0]).toHaveProperty('id');
    expect(res[0]).toHaveProperty('content');
  });


})
