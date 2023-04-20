import {
  DocumentEntity,
  createDocument,
  getDocumentById,
  getDocumentsByType,
} from '../document.entity';
import {createTestDataStore} from '../../../../test/test-utils';

const mockDocuments = [
  {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1',
    ],
    id: 'http://example.gov/credentials/test',
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
  },
  {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1',
    ],
    id: 'http://example.gov/credentials/test2',
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
  },
  {
    '@context': ['https://w3id.org/wallet/v1'],
    id: 'urn:uuid:c410e44a-9525-11ea-bb37-0242ac130002',
    name: 'My Ropsten Mnemonic 1',
    image: 'https://via.placeholder.com/150',
    description: 'For testing only, totally compromised.',
    tags: ['professional', 'organization', 'compromised'],
    correlation: ['4058a72a-9523-11ea-bb37-0242ac130002'],
    type: 'Mnemonic',
    value:
      'humble piece toy mimic miss hurdle smile awkward patch drama hurry mixture',
  },
];

describe('DocumentEntity', () => {
  beforeAll(async () => {
    await createTestDataStore();

    for (const document of mockDocuments) {
      await createDocument(document);
    }
  });

  it('should be able to find a document by id', async () => {
    const mockData = mockDocuments[0];
    const document = await getDocumentById(mockData.id);
    expect(document).toBeDefined();
    expect(document.type).toEqual(mockData.type);
  });
});
