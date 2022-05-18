import { DIDKeyManager } from "./index";

describe.only('DID module', () => {
   it('Create Keypair', async ()=>{
       const keypair = await DIDKeyManager.createDidKeyPair()
       expect(keypair).toHaveProperty('type', 'Ed25519VerificationKey2020');
       expect(keypair).toHaveProperty('publicKeyMultibase',);
       expect(keypair).toHaveProperty('privateKeyMultibase',);
   })
    it('Save DiD Key Pair', async ()=>{
        const wallet = {
            add: jest.fn()
        }
        DIDKeyManager.setWallet(wallet)
        await DIDKeyManager.saveDiDKeyPair({foo: 'bar'})
       expect(wallet.add).toBeCalledWith({
           type: 'KEY',
           foo: 'bar'
       });
   })

    it('Create DID', async ()=>{
        const keypair = await DIDKeyManager.createDidKeyPair()
        const did = await DIDKeyManager.createDID(keypair)
        expect(did).toHaveProperty('correlation',);
        expect(did.correlation.length).toBe(1);
    })

    it('Save DID Document', async ()=>{
        const wallet = {
            add: jest.fn()
        }
        DIDKeyManager.setWallet(wallet)
        await DIDKeyManager.saveDIDDocument({foo: 'bar'})
        expect(wallet.add).toBeCalledWith({
            type: 'DID',
            foo: 'bar'
        });
    })
    it('Get DIDs', async ()=>{
        const wallet = {
            query: jest.fn()
        }
        DIDKeyManager.setWallet(wallet)
        await DIDKeyManager.getDIDs()
        expect(wallet.query).toBeCalledWith({
            type: 'DID',
        });
    })

    it('Get/Set Wallet', async ()=>{
        const wallet = {}
        DIDKeyManager.setWallet(wallet)
        expect(DIDKeyManager.getWallet()).toBe(wallet);
    })
})
