import {issueCredential} from './helpers/certs-helpers';
import {
  getWallet,
  getDIDProvider,
  getMessageProvider,
  closeWallet,
} from './helpers/wallet-helpers';
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';

describe('Credential Distribution', () => {
  let wallet;

  beforeAll(async () => {
    wallet = await getWallet();
  });

  it('should send yes/no message to service endpoint', async () => {
    const wallet = await getWallet();
    const currentDID = await getDIDProvider().getDefaultDID();

    const result = await getMessageProvider().sendMessage({
      from: currentDID,
      // to: 'did:key:z6MkspAWGxhkyiMegReJuAMhCm2KxqRFg6Kfy5rFeKapT2M5',
      to: 'did:key:z6Mks5pBCgytRnjrnzJt8Dfw9KtmhiBKRpZAbfgKsx4XGJvi',
      body: {
        credentials: [
          {
            "@context": [
              "https://www.w3.org/2018/credentials/v1",
              "https://ld.truvera.io/credentials/extensions-v1",
              "https://ld.truvera.io/security/bbs23/v1",
              {
                "BasicCredential": "dk:BasicCredential",
                "dk": "https://ld.truvera.io/credentials#"
              }
            ],
            "credentialStatus": {
              "id": "accumulator:cheqd:mainnet:a29e4452-02b3-4f9b-b778-d0145e3d16c7:faff0ab1-9a8f-4cc0-a77b-08e09e767d99",
              "type": "DockVBAccumulator2022",
              "revocationCheck": "membership",
              "revocationId": "1"
            },
            "id": "https://creds.truvera.io/454936ca6be64f86abc6ec5aefa0fa98255eb1da71cb73355fa34dd55076ffaa",
            "type": [
              "VerifiableCredential",
              "BasicCredential"
            ],
            "credentialSubject": {
              "id": "test",
              "name": "testmainnet"
            },
            "issuanceDate": "2025-09-19T11:37:04.222Z",
            "issuer": {
              "name": "test-cheqd",
              "id": "did:cheqd:mainnet:a29e4452-02b3-4f9b-b778-d0145e3d16c7"
            },
            "credentialSchema": {
              "id": "https://schema.truvera.io/BasicCredential-V2-1703777584571.json",
              "type": "JsonSchemaValidator2018",
              "details": "{\"jsonSchema\":{\"$id\":\"https://schema.truvera.io/BasicCredential-V2-1703777584571.json\",\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"additionalProperties\":true,\"description\":\"A representation of a very basic example credential\",\"name\":\"Basic Credential\",\"properties\":{\"@context\":{\"type\":\"string\"},\"credentialSchema\":{\"properties\":{\"details\":{\"type\":\"string\"},\"id\":{\"type\":\"string\"},\"type\":{\"type\":\"string\"},\"version\":{\"type\":\"string\"}},\"type\":\"object\"},\"credentialStatus\":{\"properties\":{\"id\":{\"type\":\"string\"},\"revocationCheck\":{\"type\":\"string\"},\"revocationId\":{\"type\":\"string\"},\"type\":{\"type\":\"string\"}},\"type\":\"object\"},\"credentialSubject\":{\"properties\":{\"id\":{\"description\":\"A unique identifier of the recipient. Example: DID, email address, national ID number, employee ID, student ID etc.\",\"title\":\"Subject ID\",\"type\":\"string\"},\"name\":{\"description\":\"The name of the credential holder.\",\"title\":\"Subject Name\",\"type\":\"string\"}},\"required\":[\"name\"],\"type\":\"object\"},\"cryptoVersion\":{\"type\":\"string\"},\"id\":{\"type\":\"string\"},\"issuanceDate\":{\"format\":\"date-time\",\"type\":\"string\"},\"issuer\":{\"properties\":{\"id\":{\"type\":\"string\"},\"name\":{\"type\":\"string\"}},\"type\":\"object\"},\"name\":{\"type\":\"string\"},\"proof\":{\"properties\":{\"@context\":{\"items\":[{\"properties\":{\"proof\":{\"properties\":{\"@container\":{\"type\":\"string\"},\"@id\":{\"type\":\"string\"},\"@type\":{\"type\":\"string\"}},\"type\":\"object\"},\"sec\":{\"type\":\"string\"}},\"type\":\"object\"},{\"type\":\"string\"}],\"type\":\"array\"},\"created\":{\"format\":\"date-time\",\"type\":\"string\"},\"proofPurpose\":{\"type\":\"string\"},\"type\":{\"type\":\"string\"},\"verificationMethod\":{\"type\":\"string\"}},\"type\":\"object\"},\"type\":{\"type\":\"string\"}},\"type\":\"object\"},\"parsingOptions\":{\"defaultDecimalPlaces\":4,\"defaultMinimumDate\":-17592186044415,\"defaultMinimumInteger\":-4294967295,\"useDefaults\":true}}",
              "version": "0.4.0"
            },
            "name": "mainnet",
            "cryptoVersion": "0.6.0",
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
                "https://ld.truvera.io/security/bbs23/v1"
              ],
              "type": "Bls12381BBSSignatureDock2023",
              "created": "2025-09-19T11:37:37Z",
              "verificationMethod": "did:cheqd:mainnet:a29e4452-02b3-4f9b-b778-d0145e3d16c7#keys-2",
              "proofPurpose": "assertionMethod",
              "proofValue": "z2TUekhmP8o7WwGLDckzTBvutUrdhXVCvx6UpVD3gdRzgBHsDadgU65EgJ3jN6zrWpzmb7YYmsDi514TBneTNAvoTKNUo8UezH25odBomyVrQLt"
            },
            "$$accum__witness$$": "{\"blockNo\":\"af8515d8-0dc2-4fa6-ba35-38ea0f918e32\",\"witness\":\"0x8ea1988551f88656083cbcc58f96819e1cef4b49cdbce7e21094689c47256009435a466ab46e09c0863d88ef5f4a77b6\"}"
          },
        ]
      },
      type: 'https://mattr.global/schemas/verifiable-credential/offer/Direct',
    });

    expect(result.success).toBe(true);
  });

  afterAll(() => closeWallet(wallet));
});
