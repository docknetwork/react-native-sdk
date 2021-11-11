const WALLET_SIGNED_CREDENTIAL = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://www.w3.org/2018/credentials/examples/v1',
  ],
  id: 'http://example.gov/credentials/3733',
  type: ['VerifiableCredential', 'UniversityDegreeCredential'],
  issuer: {
    id: 'did:example:123456789abcdefghi',
  },
  issuanceDate: '2020-03-10T04:24:12.164Z',
  credentialSubject: {
    id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
    degree: {
      type: 'BachelorDegree',
      name: 'Bachelor of Science and Arts',
    },
  },
  proof: {
    type: 'JsonWebSignature2020',
    created: '2020-03-21T17:51:48Z',
    verificationMethod:
      'did:example:123456789abcdefghi#_Qq0UL2Fq651Q0Fjd6TvnYE-faHiOpRlPVQcY_-tA4A',
    proofPurpose: 'assertionMethod',
    jws: 'eyJiNjQiOmZhbHNlLCJjcml0IjpbImI2NCJdLCJhbGciOiJFZERTQSJ9..OPxskX37SK0FhmYygDk-S4csY_gNhCUgSOAaXFXDTZx86CmI5nU9xkqtLWg-f4cqkigKDdMVdtIqWAvaYx2JBA',
  },
};

async function updateWalletContents(wallet) {
  // TODO: update method
  const updateIndex = 0;
  console.log(`Updating wallet content at index ${updateIndex}...`);
  console.log('TODO');

  await wallet.sync();
  console.log('Contents updated');
}

export default async function runWalletExample(wallet) {
  // Load the wallet contents
  await wallet.load();

  // Add basic wallet contents if none exist
  if (wallet.contents.length === 0) {
    console.log('Wallet has no documents, adding some...');

    // Add a credential
    console.log(
      'Adding credential to the wallet...',
      WALLET_SIGNED_CREDENTIAL.id,
    );
    wallet.add(WALLET_SIGNED_CREDENTIAL);

    // Call optional sync method to ensure our storage promises
    // have succeeded and completed
    await wallet.sync();

    // Try add the same item again, it should fail
    try {
      wallet.add(WALLET_SIGNED_CREDENTIAL);
      await wallet.sync();
    } catch (e) {
      console.log(
        'Duplication check succeeded, cant insert two of the same documents.',
      );
    }

    // Update the wallet contents
    await updateWalletContents(wallet);

    console.log(
      'Wallet contents have been saved to the storage, total:',
      wallet.contents.length,
    );
    console.log(
      'Run the example again to see contents loaded from the storage',
    );
    console.log('Wallet result:', wallet.toJSON());
  } else {
    // Contents were retrieved from storage, lets display then remove them
    console.log(
      'Wallet contents have been loaded from the storage, total:',
      wallet.contents.length,
    );
    console.log('Wallet result:', wallet.toJSON());

    // Update the wallet contents
    await updateWalletContents(wallet);

    // Query wallet for specific item
    const itemResult = await wallet.query({
      equals: {
        'content.id': WALLET_SIGNED_CREDENTIAL.id,
      },
    });

    if (itemResult.length > 0) {
      console.log('Wallet content query successful, found', itemResult[0].id);
    }

    // Remove wallet contents
    console.log('Removing wallet contents from storage...');
    wallet.contents.forEach(content => {
      console.log('\tRemoving:', content.id);
      wallet.remove(content.id);
    });

    // Call optional sync method to ensure our storage promises
    // have succeeded and completed
    await wallet.sync();

    console.log(
      'Wallet contents have been removed from the storage, run the example again to re-create it',
    );
  }
}
