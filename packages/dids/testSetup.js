jest.mock('did-method-key', () => {

  const driverFunctions = {
    generate: jest.fn(()=>{
      return {
        id: 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'
      }
    }),
    get: jest.fn()
  }

  return {
    __esModule: true,
    driver: ()=> driverFunctions
  };
});


jest.mock('@docknetwork/wallet-sdk-core/lib/modules/wallet', () => {

  const walletInstance = {
    add: jest.fn(()=>{
      return {
        '@context': [],
        id: '',
        name: 'any',
        type: {},
        value: {  },
        correlation: [],
      }
    }),
    query: jest.fn().mockResolvedValue([
      {
        "@context": ["https://w3id.org/wallet/v1"],
        id: "did:example:123456789abcdefghi",
        type: "DID",
        value: {
          '@context': [ 'https://w3id.org/did/v0.11' ],
          id: 'did:key:z6MkwdAManAKt5L5tp1BChkzfH1vESsdUbpnBcsnedsqqPRV',
          publicKey: [
            {
              id: 'did:key:z6MkwdAManAKt5L5tp1BChkzfH1vESsdUbpnBcsnedsqqPRV#z6MkwdAManAKt5L5tp1BChkzfH1vESsdUbpnBcsnedsqqPRV',
              type: 'Ed25519VerificationKey2018',
              controller: 'did:key:z6MkwdAManAKt5L5tp1BChkzfH1vESsdUbpnBcsnedsqqPRV',
              publicKeyBase58: 'JAuJzXutYXqcnKAUX8o9pBTvQsbn4iaRVbxrpMupvAe7'
            }
          ],
          authentication: [
            'did:key:z6MkwdAManAKt5L5tp1BChkzfH1vESsdUbpnBcsnedsqqPRV#z6MkwdAManAKt5L5tp1BChkzfH1vESsdUbpnBcsnedsqqPRV'
          ],
        }
      }
    ])
  }

  return {
    __esModule: true,
    Wallet: {
      getInstance: ()=> walletInstance
    }
  };
});
