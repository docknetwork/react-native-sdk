const {createWallet} = require('@docknetwork/wallet-sdk-core/lib/wallet');
const {
  credentialServiceRPC,
} = require('@docknetwork/wallet-sdk-wasm/src/services/credential');
const {
  didServiceRPC,
} = require('@docknetwork/wallet-sdk-wasm/src/services/dids');

const {blockchainService} = require('@docknetwork/wallet-sdk-wasm/src/services/blockchain');

const exampleCredential = require('./example-credential.json');
const presentationDefinition = require('./presentation-definition.json');

async function main() {
  const wallet = await createWallet({
    defaultNetwork: 'testnet',
    databasePath: ':memory:',
  });

  console.log('Connecting to dock network');

  await blockchainService.ensureBlockchainReady();

  // generate new DID
  const keyDoc = await didServiceRPC.generateKeyDoc({});

  console.log(keyDoc);

  // Fetching and adding credential to the wallet
  let credential = await wallet.getDocumentById(exampleCredential.id);

  if (!credential) {
    console.log('Adding credential to the wallet');
    await wallet.addDocument(exampleCredential);
    credential = exampleCredential;
  }

  console.log(credential);

  console.log('Credential loaded in the wallet');
  console.log('Verifying the credential...');

  // check if credential is valid
  const isValid = await credentialServiceRPC.verifyCredential({
    credential,
  });

  console.log('Credential is valid:', isValid);

  // create a presentation
  const challenge = `${Date.now()}`;
  const id = credential.id;
  const domain = 'dock.io';

  const presentation = await credentialServiceRPC.createPresentation({
    credentials: [credential],
    keyDoc,
    challenge,
    id,
    domain,
  });

  console.log('Presentation created');
  console.log(presentation);

  // verify the presentation

  const result = await credentialServiceRPC.evaluatePresentation({
    presentation,
    presentationDefinition,
  });

  console.log('Verification results');

  console.log(result);
}

main();
