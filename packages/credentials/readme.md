
# Credentials manager

Credential manager for the dock wallet sdk

On react native it's required to setup the WalletSDKProvider, described on the following package https://www.npmjs.com/package/@docknetwork/wallet-sdk-react-native

```
import {Credentials} from '@docknetwork/wallet-sdk-credentials/lib';


// add credential 
const credential = await Credentials.getInstance().add({
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    {
      "dk": "https://ld.dock.io/credentials#",
      "BasicCredential": "dk:BasicCredential",
      "subjectName": "dk:subjectName",
      "title": "dk:title",
      "name": "dk:name",
      "logo": "dk:logo",
      "description": "dk:description"
    }
  ],
  "credentialStatus": {
    "id": "rev-reg:dock:0xeb9af88d712412dbd2c5c7e7e5e734641215ab8b1423fb7174e088f012985acf",
    "type": "CredentialStatusList2017"
  },
  "id": "https://creds.dock.io/1d28317eb63495340414fb11346d5b7f5fd50b65aa06c8064d88ec3ec993a29b",
  "type": [
    "VerifiableCredential",
    "BasicCredential"
  ],
  "credentialSubject": {
    "id": "test-id",
    "subjectName": "Dock Wallet SDK",
    "title": "Credential title"
  },
  "issuanceDate": "2022-03-25T10:28:18.848Z",
  "proof": {
    "type": "Sr25519Signature2020",
    "created": "2022-03-25T10:29:16Z",
    "verificationMethod": "did:dock:5Ey2GDHLnX4tgyU4vBoKP2umWaQSCpNLPrVGQMVhaixdqTNB#keys-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z5mXoaeQBRLPZpVioixesWKWa7KZsUYDqVhtatX7rdFqP7cuAG3BeP8ExYQQjarwuAwJPrdvYuJfKFFiB4JR3bm1h"
  },
  "issuer": {
    "name": "Dock Network",
    "description": "Dock Network",
    "id": "did:dock:5Ey2GDHLnX4tgyU4vBoKP2umWaQSCpNLPrVGQMVhaixdqTNB"
  }
}
);

// query credentials
const items = await Credentials.getInstance().query();


// remove credential
await Credentials.getInstance().remove(credential.id);


```