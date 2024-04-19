import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {
  closeWallet,
  getCredentialProvider,
  getWallet,
} from '../helpers/wallet-helpers';
import {createVerificationController} from '@docknetwork/wallet-sdk-core/src/verification-controller';
import {verifyPresentation} from '@docknetwork/sdk/utils/vc/presentations';
import axios from 'axios';
import {ProofTemplateIds, createProofRequest} from '../helpers/certs-helpers';

const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://ld.dock.io/security/bbs/v1',
    {
      dk: 'https://ld.dock.io/credentials#',
      BasicCredential: 'dk:BasicCredential',
      name: 'dk:name',
      description: 'dk:description',
      logo: 'dk:logo',
    },
  ],
  credentialStatus: {
    id: 'dock:accumulator:0xa987780d8b3146840048eaee2243359bfe7d9884d50c0e0012f1ba4171a6046e',
    type: 'DockVBAccumulator2022',
    revocationCheck: 'membership',
    revocationId: '4',
  },
  id: 'https://creds-testnet.dock.io/ea5cdb2bbce199957d31715532f6fd2c5597e8f6774d24dfa46b6651877f433e',
  type: ['VerifiableCredential', 'BasicCredential'],
  credentialSubject: {
    id: 'did:key:z6Mku9R8zdA8LD6hcFXkn47jLnfcKZNGmwaTrDnaCBkSb8Un',
    name: 'Wallet CI - BBS+ not revoked',
  },
  issuanceDate: '2024-04-19T16:44:58.828Z',
  issuer: {
    name: 'Dock Labs',
    description:
      'Business automation with verified data in a privacy preserving manner.',
    logo: 'https://img.dock.io/a4d62cf3697ae38c329af20cbdb1dc2c',
    id: 'did:dock:5CxMzC6TujZCLNHNgQWVUdCwnoct4jmdtGe3k5GArVcXvdw3',
  },
  credentialSchema: {
    id: "data:application/json;charset=utf-8,%7B%22%24id%22%3A%22https%3A%2F%2Fschema.dock.io%2FBasicCredential-V2-1703777584571.json%22%2C%22%24schema%22%3A%22http%3A%2F%2Fjson-schema.org%2Fdraft-07%2Fschema%23%22%2C%22additionalProperties%22%3Atrue%2C%22description%22%3A%22A%20representation%20of%20a%20very%20basic%20example%20credential%22%2C%22name%22%3A%22Basic%20Credential%22%2C%22properties%22%3A%7B%22%40context%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSchema%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialStatus%22%3A%7B%22properties%22%3A%7B%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22revocationCheck%22%3A%7B%22type%22%3A%22string%22%7D%2C%22revocationId%22%3A%7B%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22credentialSubject%22%3A%7B%22properties%22%3A%7B%22id%22%3A%7B%22description%22%3A%22A%20unique%20identifier%20of%20the%20recipient.%20Example%3A%20DID%2C%20email%20address%2C%20national%20ID%20number%2C%20employee%20ID%2C%20student%20ID%20etc.%20If%20you%20enter%20the%20recipient's%20DID%2C%20the%20person%20will%20automatically%20receive%20the%20credential%20in%20their%20Dock%20wallet.%22%2C%22title%22%3A%22Subject%20ID%22%2C%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22description%22%3A%22The%20name%20of%20the%20credential%20holder.%22%2C%22title%22%3A%22Subject%20Name%22%2C%22type%22%3A%22string%22%7D%7D%2C%22required%22%3A%5B%22name%22%5D%2C%22type%22%3A%22object%22%7D%2C%22cryptoVersion%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22issuanceDate%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22issuer%22%3A%7B%22properties%22%3A%7B%22description%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22logo%22%3A%7B%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%2C%22proof%22%3A%7B%22properties%22%3A%7B%22%40context%22%3A%7B%22items%22%3A%5B%7B%22properties%22%3A%7B%22proof%22%3A%7B%22properties%22%3A%7B%22%40container%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22sec%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%2C%22type%22%3A%22array%22%7D%2C%22created%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22proofPurpose%22%3A%7B%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%2C%22verificationMethod%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D",
    type: 'JsonSchemaValidator2018',
    parsingOptions: {
      useDefaults: true,
      defaultMinimumInteger: -4294967295,
      defaultMinimumDate: -17592186044415,
      defaultDecimalPlaces: 4,
    },
    version: '0.3.0',
  },
  name: 'Wallet CI - BBS+ not revoked',
  cryptoVersion: '0.5.0',
  proof: {
    '@context': [
      {
        sec: 'https://w3id.org/security#',
        proof: {
          '@id': 'sec:proof',
          '@type': '@id',
          '@container': '@graph',
        },
      },
      'https://ld.dock.io/security/bbs/v1',
    ],
    type: 'Bls12381BBS+SignatureDock2022',
    created: '2024-04-19T16:46:09Z',
    verificationMethod:
      'did:dock:5CxMzC6TujZCLNHNgQWVUdCwnoct4jmdtGe3k5GArVcXvdw3#keys-2',
    proofPurpose: 'assertionMethod',
    proofValue:
      'zTtPPJAa7JXgT3AwQP51Bk5WGLpWNxTAzRTMTXGEPoxMMeSxW83pNasSjcUh9hbKgDD1MTC41JVJLysWXQDqYkJfs58Sucg7GfZH3t1ZiqJZmYvPeJ7PU59u4fNCCeu6K91n1PBcnLWeVpKGkes2z5nNcf',
  },
  $$accum__witness$$:
    '0xa7ef89c25ad2248238aed686a108f2dff3744a64ecf510a64e04d35e5adc5e8a1b7589e969803491ece6b622863cb95d',
};

const revokedCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://ld.dock.io/security/bbs/v1',
    {
      dk: 'https://ld.dock.io/credentials#',
      BasicCredential: 'dk:BasicCredential',
      name: 'dk:name',
      description: 'dk:description',
      logo: 'dk:logo',
    },
  ],
  credentialStatus: {
    id: 'dock:accumulator:0xa987780d8b3146840048eaee2243359bfe7d9884d50c0e0012f1ba4171a6046e',
    type: 'DockVBAccumulator2022',
    revocationCheck: 'membership',
    revocationId: '3',
  },
  id: 'https://creds-testnet.dock.io/2c360d144aedeaff75032e7d7e373d94b60f7d9cefe26dd8467d8ea1ec04a4dd',
  type: ['VerifiableCredential', 'BasicCredential'],
  credentialSubject: {
    id: 'did:key:z6Mku9R8zdA8LD6hcFXkn47jLnfcKZNGmwaTrDnaCBkSb8Un',
    name: 'Wallet CI',
  },
  issuanceDate: '2024-04-18T19:39:05.368Z',
  issuer: {
    name: 'Dock Labs',
    description:
      'Business automation with verified data in a privacy preserving manner.',
    logo: 'https://img.dock.io/a4d62cf3697ae38c329af20cbdb1dc2c',
    id: 'did:dock:5CxMzC6TujZCLNHNgQWVUdCwnoct4jmdtGe3k5GArVcXvdw3',
  },
  credentialSchema: {
    id: "data:application/json;charset=utf-8,%7B%22%24id%22%3A%22https%3A%2F%2Fschema.dock.io%2FBasicCredential-V2-1703777584571.json%22%2C%22%24schema%22%3A%22http%3A%2F%2Fjson-schema.org%2Fdraft-07%2Fschema%23%22%2C%22additionalProperties%22%3Atrue%2C%22description%22%3A%22A%20representation%20of%20a%20very%20basic%20example%20credential%22%2C%22name%22%3A%22Basic%20Credential%22%2C%22properties%22%3A%7B%22%40context%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSchema%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialStatus%22%3A%7B%22properties%22%3A%7B%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22revocationCheck%22%3A%7B%22type%22%3A%22string%22%7D%2C%22revocationId%22%3A%7B%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22credentialSubject%22%3A%7B%22properties%22%3A%7B%22id%22%3A%7B%22description%22%3A%22A%20unique%20identifier%20of%20the%20recipient.%20Example%3A%20DID%2C%20email%20address%2C%20national%20ID%20number%2C%20employee%20ID%2C%20student%20ID%20etc.%20If%20you%20enter%20the%20recipient's%20DID%2C%20the%20person%20will%20automatically%20receive%20the%20credential%20in%20their%20Dock%20wallet.%22%2C%22title%22%3A%22Subject%20ID%22%2C%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22description%22%3A%22The%20name%20of%20the%20credential%20holder.%22%2C%22title%22%3A%22Subject%20Name%22%2C%22type%22%3A%22string%22%7D%7D%2C%22required%22%3A%5B%22name%22%5D%2C%22type%22%3A%22object%22%7D%2C%22cryptoVersion%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22issuanceDate%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22issuer%22%3A%7B%22properties%22%3A%7B%22description%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22logo%22%3A%7B%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%2C%22proof%22%3A%7B%22properties%22%3A%7B%22%40context%22%3A%7B%22items%22%3A%5B%7B%22properties%22%3A%7B%22proof%22%3A%7B%22properties%22%3A%7B%22%40container%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22sec%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%2C%22type%22%3A%22array%22%7D%2C%22created%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22proofPurpose%22%3A%7B%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%2C%22verificationMethod%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D",
    type: 'JsonSchemaValidator2018',
    parsingOptions: {
      useDefaults: true,
      defaultMinimumInteger: -4294967295,
      defaultMinimumDate: -17592186044415,
      defaultDecimalPlaces: 4,
    },
    version: '0.3.0',
  },
  name: 'Wallet CI',
  cryptoVersion: '0.5.0',
  proof: {
    '@context': [
      {
        sec: 'https://w3id.org/security#',
        proof: {
          '@id': 'sec:proof',
          '@type': '@id',
          '@container': '@graph',
        },
      },
      'https://ld.dock.io/security/bbs/v1',
    ],
    type: 'Bls12381BBS+SignatureDock2022',
    created: '2024-04-18T19:40:24Z',
    verificationMethod:
      'did:dock:5CxMzC6TujZCLNHNgQWVUdCwnoct4jmdtGe3k5GArVcXvdw3#keys-2',
    proofPurpose: 'assertionMethod',
    proofValue:
      'zUGMasNZggKJXn4YL4JX7ShzoecwzzLAjLtHrXpNw5uFFL3xrQcbDBtwZZ8UPfRMdALnF3Kh369yaTkgXXPMELJH7A6Ccu4Tudanngk5n6rTre3wUgrXtHEEJCEzBbqWUZ5aRoBAaX1UWETuDZdmgXHi4w',
  },
  $$accum__witness$$:
    '0xb682646169f670efd0d96872c8c437dd6dba6d2cc3133e7fb6ea7dcb05a648f31816cccb3c1f286ce56171e165d6c4de',
};

describe('BBS+ revocation', () => {
  it('should verify a revokable bbs+ credential', async () => {
    const wallet: IWallet = await getWallet();

    getCredentialProvider().addCredential(credential);

    const proofRequest = await createProofRequest(
      ProofTemplateIds.ANY_CREDENTIAL,
    );

    const controller = await createVerificationController({
      wallet,
    });

    await controller.start({
      template: proofRequest,
    });

    let attributesToReveal = ['credentialSubject.name'];

    controller.selectedCredentials.set(credential.id, {
      credential: credential,
      attributesToReveal,
    });

    const presentation = await controller.createPresentation();
    console.log('Presentation generated');
    console.log(JSON.stringify(presentation, null, 2));
    console.log('Sending presentation to Certs API');

    let certsResponse;
    try {
      certsResponse = await controller.submitPresentation(presentation);
      console.log('CERTS response');
      console.log(JSON.stringify(certsResponse, null, 2));
      
    } catch (err) {
      certsResponse = err.response.data;
      console.log('Certs API returned an error');
      console.log(JSON.stringify(certsResponse, null, 2));
    }

    expect(certsResponse.verified).toBe(true);
  });

  it('should handle a revoked bbs+ credential as not valid', async () => {
    const wallet: IWallet = await getWallet();

    getCredentialProvider().addCredential(revokedCredential);

    const proofRequest = await createProofRequest(ProofTemplateIds.ANY_CREDENTIAL);

    const controller = await createVerificationController({
      wallet,
    });

    await controller.start({
      template: proofRequest,
    });

    let attributesToReveal = ['credentialSubject.name'];

    controller.selectedCredentials.set(revokedCredential.id, {
      credential: revokedCredential,
      attributesToReveal,
    });

    const presentation = await controller.createPresentation();
    console.log('Presentation generated');
    console.log(JSON.stringify(presentation, null, 2));
    console.log('Sending presentation to Certs API');

    let data;

    try {
      const certsResponse = await controller.submitPresentation(presentation);
      console.log('CERTS response');
      console.log(JSON.stringify(certsResponse, null, 2));
    } catch (err) {
      data = err.response.data;
      console.log('Certs API returned an error');
      console.log(JSON.stringify(data, null, 2));
    }

    expect(data.status).toBe(400);
    // The current error message from certs is the following:
    // Credential not verified: Invalid anoncreds presentation due to error: VBAccumProofContributionFailed(1, PairingResponseInvalid)
  });

  afterAll(() => closeWallet());
});
