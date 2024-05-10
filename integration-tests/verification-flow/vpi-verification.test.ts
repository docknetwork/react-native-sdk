import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {
  closeWallet,
  getCredentialProvider,
  getWallet,
} from '../helpers/wallet-helpers';
import {createVerificationController} from '@docknetwork/wallet-sdk-core/src/verification-controller';
import {ProofTemplateIds, createProofRequest} from '../helpers/certs-helpers';

const credential = {
  "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1",
      "https://ld.dock.io/security/bddt16/v1",
      {
          "dk": "https://ld.dock.io/credentials#",
          "name": "dk:name"
      }
  ],
  "id": "https://creds-staging.dock.io/f20a0b87efb4ccd4313b2d08056e48e12a1927d747d68bb2d45c722d9cd8e6be",
  "type": [
      "VerifiableCredential",
      "BasicCredential"
  ],
  "credentialSubject": {
      "id": "did:key:z6Mkujh84aPZ3EaYP6t7ftS2kLRkw6G7pkKswEJq2bn86ALs",
      "name": "T VPI"
  },
  "issuanceDate": "2024-05-03T06:50:36.901Z",
  "issuer": {
      "name": "Profile bbs",
      "id": "did:dock:5CDpZeS2fAas4Du87f2VyTj1BospmvQ5BZwZrKFtb3GeAppq"
  },
  "credentialSchema": {
      "id": "data:application/json;charset=utf-8,%7B%22%24id%22%3A%22https%3A%2F%2Fschema.dock.io%2FBasicCredential-V2-1703777584571.json%22%2C%22%24schema%22%3A%22http%3A%2F%2Fjson-schema.org%2Fdraft-07%2Fschema%23%22%2C%22additionalProperties%22%3Atrue%2C%22description%22%3A%22A%20representation%20of%20a%20very%20basic%20example%20credential%22%2C%22name%22%3A%22Basic%20Credential%22%2C%22properties%22%3A%7B%22%40context%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSchema%22%3A%7B%22type%22%3A%22string%22%7D%2C%22credentialSubject%22%3A%7B%22properties%22%3A%7B%22id%22%3A%7B%22description%22%3A%22A%20unique%20identifier%20of%20the%20recipient.%20Example%3A%20DID%2C%20email%20address%2C%20national%20ID%20number%2C%20employee%20ID%2C%20student%20ID%20etc.%20If%20you%20enter%20the%20recipient's%20DID%2C%20the%20person%20will%20automatically%20receive%20the%20credential%20in%20their%20Dock%20wallet.%22%2C%22title%22%3A%22Subject%20ID%22%2C%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22description%22%3A%22The%20name%20of%20the%20credential%20holder.%22%2C%22title%22%3A%22Subject%20Name%22%2C%22type%22%3A%22string%22%7D%7D%2C%22required%22%3A%5B%22name%22%5D%2C%22type%22%3A%22object%22%7D%2C%22cryptoVersion%22%3A%7B%22type%22%3A%22string%22%7D%2C%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22issuanceDate%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22issuer%22%3A%7B%22properties%22%3A%7B%22id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22name%22%3A%7B%22type%22%3A%22string%22%7D%2C%22proof%22%3A%7B%22properties%22%3A%7B%22%40context%22%3A%7B%22items%22%3A%5B%7B%22properties%22%3A%7B%22proof%22%3A%7B%22properties%22%3A%7B%22%40container%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40id%22%3A%7B%22type%22%3A%22string%22%7D%2C%22%40type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22sec%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%7B%22type%22%3A%22string%22%7D%5D%2C%22type%22%3A%22array%22%7D%2C%22created%22%3A%7B%22format%22%3A%22date-time%22%2C%22type%22%3A%22string%22%7D%2C%22proofPurpose%22%3A%7B%22type%22%3A%22string%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%2C%22verificationMethod%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D%2C%22type%22%3A%7B%22type%22%3A%22string%22%7D%7D%2C%22type%22%3A%22object%22%7D",
      "type": "JsonSchemaValidator2018",
      "parsingOptions": {
          "useDefaults": true,
          "defaultMinimumInteger": -4294967295,
          "defaultMinimumDate": -17592186044415,
          "defaultDecimalPlaces": 4
      },
      "version": "0.3.0"
  },
  "name": "VPI credential",
  "cryptoVersion": "0.5.0",
  "proof": {
      "@context": [
          {
              "sec": "https://w3id.org/security#",
              "proof": {
                  "@id": "sec:proof",
                  "@type": "@id",
                  "@container": "@graph"
              }
          },
          "https://ld.dock.io/security/bddt16/v1"
      ],
      "type": "Bls12381BDDT16MACDock2024",
      "created": "2024-05-03T06:50:37Z",
      "verificationMethod": "did:dock:5CDpZeS2fAas4Du87f2VyTj1BospmvQ5BZwZrKFtb3GeAppq#7jvC9bs4PXheGvBsbRUQQqXCXddRBK1fNmZfJfTnM7HW6jioKVBZN35tFLyG2yTte9",
      "proofPurpose": "assertionMethod",
      "proofValue": "zb1UmaJsbUqDCLDYdmhR34kFD1YdcwaJc3YbN3kXJKn7g6zpZwVCKUufKtnaJJ8AthESCz2txWBMm7MsjoEsFEEz1kpWVBTsPQrYPm3hU7o4MA1KT1MkwLmqy5VCbaLbSdBoXZWaAzkkbZmd2453XS9iBV"
  }
}

describe('VPI verification', () => {
  it('should verify a vpi credential', async () => {
    const wallet: IWallet = await getWallet();

    getCredentialProvider().addCredential(credential);

    const proofRequest = await createProofRequest(
      ProofTemplateIds.ANY_CREDENTIAL,
    );

    const result: any = await getCredentialProvider().isValid(credential);

    expect(result.status).toBe('verified');

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

  afterAll(() => closeWallet());
});
