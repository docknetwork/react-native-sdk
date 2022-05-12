jest.mock('did-method-key', () => {

  const realmFunctions = {
    generate: jest.fn(()=>{
      return {
        id: 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH'
      }
    }),
    get: jest.fn()
  }

  return {
    __esModule: true,
    driver: ()=> realmFunctions
  };
});


jest.mock('@docknetwork/wallet-sdk-core/lib/modules/wallet', () => {

  const realmFunctions = {
    add: jest.fn(()=>{})
  }

  return {
    __esModule: true,
    Wallet: {
      getInstance: ()=> realmFunctions
    }
  };
});
