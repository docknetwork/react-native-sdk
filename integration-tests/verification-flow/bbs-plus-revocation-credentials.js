const testAPIURL = process.env.TESTING_API_URL || null;
const testCredsURL = testAPIURL.replace('api-', 'creds-');

export const bbsPlusRevocationCredential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://ld.dock.io/credentials/extensions-v1',
    'https://ld.dock.io/security/bbs23/v1',
    {
      UniversityDegree: 'dk:UniversityDegree',
      awardedDate: 'dk:awardedDate',
      dateOfBirth: 'dk:dateOfBirth',
      degreeName: 'dk:degreeName',
      degreeType: 'dk:degreeType',
      dk: 'https://ld.dock.io/credentials#',
    },
  ],
  credentialStatus: {
    id: 'dock:accumulator:0x79da1c2961f6ed86cdac976b005c33e18423e0be6b3db2ce2ef30688643ee7e3',
    type: 'DockVBAccumulator2022',
    revocationCheck: 'membership',
    revocationId: '1',
  },
  id: `${testCredsURL}/f39c50b62fbea5caf6b059c1a3d0c7e7698ddee835975e764f72b7d2d5155d03`,
  type: ['VerifiableCredential', 'UniversityDegree'],
  credentialSubject: {
    degreeName: 'test',
    degreeType: 'test',
    awardedDate: '2012-12-12',
    name: 'AGne',
    dateOfBirth: '1990-09-27',
  },
  issuanceDate: '2024-11-19T15:24:02.136Z',
  issuer: {
    name: 'Test',
    description: 'test',
    id: 'did:dock:5H5ZjidRCpgCooMzPYSaKSvqvGQLS34WHByhM4PjS28gKa3L',
  },
  credentialSchema: {
    id: 'https://schema.dock.io/UniversityDegree-V1-1703767509472.json',
    type: 'JsonSchemaValidator2018',
    details:
      '{"jsonSchema":{"$id":"https://schema.dock.io/UniversityDegree-V1-1703767509472.json","$schema":"http://json-schema.org/draft-07/schema#","additionalProperties":true,"description":"A representation of a university degree issued to a person","name":"University Degree","properties":{"@context":{"type":"string"},"credentialSchema":{"properties":{"details":{"type":"string"},"id":{"type":"string"},"type":{"type":"string"},"version":{"type":"string"}},"type":"object"},"credentialStatus":{"properties":{"id":{"type":"string"},"revocationCheck":{"type":"string"},"revocationId":{"type":"string"},"type":{"type":"string"}},"type":"object"},"credentialSubject":{"properties":{"awardedDate":{"description":"The date the degree was awarded.","format":"date","title":"Awarded Date","type":"string"},"dateOfBirth":{"description":"The person\'s date of birth.","format":"date","title":"Date of Birth","type":"string"},"degreeName":{"description":"The full degree name and field.","title":"Degree Name","type":"string"},"degreeType":{"description":"The type of degree earned.","title":"Degree Type","type":"string"},"name":{"description":"The person\'s full name.","title":"Full Name","type":"string"}},"required":["name","awardedDate"],"type":"object"},"cryptoVersion":{"type":"string"},"id":{"type":"string"},"issuanceDate":{"format":"date-time","type":"string"},"issuer":{"properties":{"description":{"type":"string"},"id":{"type":"string"},"name":{"type":"string"}},"type":"object"},"name":{"type":"string"},"proof":{"properties":{"@context":{"items":[{"properties":{"proof":{"properties":{"@container":{"type":"string"},"@id":{"type":"string"},"@type":{"type":"string"}},"type":"object"},"sec":{"type":"string"}},"type":"object"},{"type":"string"}],"type":"array"},"created":{"format":"date-time","type":"string"},"proofPurpose":{"type":"string"},"type":{"type":"string"},"verificationMethod":{"type":"string"}},"type":"object"},"type":{"type":"string"}},"type":"object"},"parsingOptions":{"defaultDecimalPlaces":4,"defaultMinimumDate":-17592186044415,"defaultMinimumInteger":-4294967295,"useDefaults":true}}',
    version: '0.4.0',
  },
  name: 'University Degree',
  cryptoVersion: '0.6.0',
  proof: {
    '@context': [
      {
        sec: 'https://w3id.org/security#',
        proof: {'@id': 'sec:proof', '@type': '@id', '@container': '@graph'},
      },
      'https://ld.dock.io/security/bbs23/v1',
    ],
    type: 'Bls12381BBSSignatureDock2023',
    created: '2024-11-19T15:24:43Z',
    verificationMethod:
      'did:dock:5H5ZjidRCpgCooMzPYSaKSvqvGQLS34WHByhM4PjS28gKa3L#keys-3',
    proofPurpose: 'assertionMethod',
    proofValue:
      'z2RGyjwikX8GU2TmrXQcu7dVhMYiAt9FLppKi1YmWYwySzpJjt6zCYX6AqCYazmkhM3sx3dTt7CoHV29P3q8SydkebSrXmvRGq1WN7YW1JMHddN',
  },
  $$accum__witness$$:
    '{"blockNo":10290900,"witness":"0x8c183483cf1b5b61465010ae8b1b18b7adde816506d3f958298be65d01889ef58816db5e7940da8ff187ba9fdc1b9915"}',
};

export const credentialWithUpdatedWitness = {
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
    revocationId: '7',
  },
  id: 'https://creds-testnet.dock.io/33342a928db5341bf1844628e81128672dad602f02f33622e030904ac6e1ce43',
  type: ['VerifiableCredential', 'BasicCredential'],
  credentialSubject: {
    id: 'did:key:z6Mku9R8zdA8LD6hcFXkn47jLnfcKZNGmwaTrDnaCBkSb8Un',
    name: 'Test Revocation',
  },
  issuanceDate: '2024-04-22T19:22:37.511Z',
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
  name: 'Test Revocation',
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
    created: '2024-04-22T19:23:35Z',
    verificationMethod:
      'did:dock:5CxMzC6TujZCLNHNgQWVUdCwnoct4jmdtGe3k5GArVcXvdw3#keys-2',
    proofPurpose: 'assertionMethod',
    proofValue:
      'zZobDnxvYcsizjtEtgQ65wJeq8ireRqhsvzQq3rf2EP9h7eNNuiT9n7VeToaadoQzhJFhZQUVsqCrPWXedgwLBu2R4fKAWGvpFedvUR484TJD9KRqa7aesHVqw2hRfvJWWxJGj4AcreWP6ncvnn4soShj7',
  },
  $$accum__witness$$:
    '0xb6c64a2e637ea063d3b8e8557be7585118571e9e66d522a6fb2e25c5560b3a0e3402cfa4fe773c95fd9ff00f8caf3cee',
};

export const bbsPlusRevokedCredential = {
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
