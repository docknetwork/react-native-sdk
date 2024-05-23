# Purpose

The biometrics plugin provides a way to perform a credential verification using the user biometric data. It is useful to garantee that only the biometric holder can perform the verification.

# How to trigger a biometric verification

To trigger a biometric verification, you need to use a verification template that asks for the biometric attributes. Check the following example:

```json
{
  "id": "Credential 1",
  "name": "Forsur Verification - Biometrics Enrollment",
  "purpose": "Forsur wants to verify the ownership of - Biometrics Enrollment and the validity of the Biometrics Credentials.",
  "constraints": {
    "fields": [
      {
        "path": ["$.credentialSubject.id"]
      },
      {
        "path": ["$.credentialSubject.biometric.id"]
      },
      {
        "path": ["$.credentialSubject.biometric.created"]
      },
      {
        "path": [
          "$.issuer.id",
          "$.issuer",
          "$.vc.issuer.id",
          "$.vc.issuer",
          "$.iss"
        ],
        "filter": {
          "const": "did:dock:5HLbQLSmirNuZVRsdWKbsgdajw9QTGzSFJABSVzMT5EBj5sb"
        },
        "predicate": "required"
      }
    ]
  }
}
```

The presence of the following fields should trigger the biometric check:

```json
{
  "path": ["$.credentialSubject.biometric.id"]
},
{
  "path": ["$.credentialSubject.biometric.created"]
}
```

# How to enable the biometric plugin in the wallet
To enable the biometric plugin in a whilte label wallet you need to edit the following file src/wallet-sdk-configs.ts and add your configuration:
```typescript
import { BiometricsPluginConfigs } from "@docknetwork/wallet-sdk-react-native/lib/default-biometrics-plugin";
export const biometricsPluginConfigs: BiometricsPluginConfigs = {
  enrollmentCredentialType: "ForSurBiometricEnrollment",
  biometricMatchCredentialType: "ForSurBiometric",
  issuerConfigs: [
    {
      networkId: "testnet or mainnet",
      did: "<The issuer DID>",
      apiKey:
        "<CERTS-API-KEY>",
      apiUrl: "https://api-testnet.dock.io or https://api.dock.io",
    },
  ],
};

```


# Credential expiration
Credential expiration allows the biometric service provider to specify a maximum length to the validity of a biometric check credential. If the verifier wants to force a refresh of the biometric check more frequently, the verifier can check the credential creation timestamp during verification to ensure it’s within their business rules.

# Biometric rotation
Every time a new biometric check credential is added to the wallet by the default biometric service provider, the old ones are removed from the wallet.

# Adding a custom biometric provider
Adding a custom biometric provider will require the development of the plugin following the interface defined at packages/react-native/lib/default-biometrics-plugin.ts. The plugin should implement the following methods:

- hasProofOfBiometrics: Checks if the verification template is asking for biometric attributes.
- enrollBiometrics: Enrolls the biometric data.
- matchBiometrics: Perform the biometric match and issue a biometric credential.


