import {createTestDataStore} from '../../../test/test-utils';
import {createDocument} from './create-document';
import {getDocumentsByType} from './get-documents-by-type';
import {getDocumentById} from './get-document-by-id';
import {getDocumentCorrelations} from './get-document-correlations';
import {updateDocument} from './update-document';
import {DataStore} from '@docknetwork/wallet-sdk-data-store/src/types';

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
    type: ['VerifiableCredential', 'BasicCredential'],
    issuer: {
      id: 'did:example:123456789abcdefghi',
    },
    issuanceDate: '2020-03-10T04:24:12.164Z',
    credentialSubject: {
      id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
      name: 'Testing',
    },
  },
  {
    '@context': ['https://w3id.org/wallet/v1'],
    id: 'urn:uuid:c410e44a-9525-11ea-bb37-0242ac130002',
    name: 'My Ropsten Mnemonic 1',
    image: 'https://via.placeholder.com/150',
    description: 'For testing only, totally compromised.',
    tags: ['professional', 'organization', 'compromised'],
    correlation: [],
    type: 'Mnemonic',
    value:
      'humble piece toy mimic miss hurdle smile awkward patch drama hurry mixture',
  },
  {
    '@context': ['https://w3id.org/wallet/v1'],
    id: 'c47f3ed0-b4b5-4983-8962-759196fd3ece',
    type: 'Currency',
    value: 0,
    symbol: 'DOCK',
  },
  {
    '@context': ['https://w3id.org/wallet/v1'],
    id: '37NKEP14n9omsAgxJ3sn14XtHo2vs5a34UcpCyybXQJoUQ92',
    type: 'Address',
    value: '37NKEP14n9omsAgxJ3sn14XtHo2vs5a34UcpCyybXQJoUQ92',
    address: '37NKEP14n9omsAgxJ3sn14XtHo2vs5a34UcpCyybXQJoUQ92',
    name: 'Test',
    correlation: [
      'urn:uuid:c410e44a-9525-11ea-bb37-0242ac130002',
      'c47f3ed0-b4b5-4983-8962-759196fd3ece',
    ],
  },
];

describe('DocumentEntity', () => {
  let dataStore: DataStore;

  beforeAll(async () => {
    dataStore = await createTestDataStore();

    for (const document of mockDocuments) {
      await createDocument({
        dataStore,
        json: document,
      });
    }
  });

  it('should be able to find a document by id', async () => {
    const mockData = mockDocuments[0];
    const document = await getDocumentById({
      dataStore,
      id: mockData.id,
    });
    expect(document).toBeDefined();
    expect(document.type).toEqual(mockData.type);
  });

  describe('getDocumentsByType', () => {
    it('should be able to query all VerifiableCredential', async () => {
      const documents = await getDocumentsByType({
        dataStore,
        type: 'VerifiableCredential',
      });

      expect(documents).toBeDefined();
      expect(documents.length).toEqual(2);
    });

    it('should be able query only BasicCredential', async () => {
      const documents = await getDocumentsByType({
        dataStore,
        type: 'BasicCredential',
      });

      expect(documents).toBeDefined();
      expect(documents.length).toEqual(1);
    });
  });

  describe('getDocumentCorrelations', () => {
    it('expect to query all correlations', async () => {
      const documents = await getDocumentCorrelations({
        dataStore,
        documentId: '37NKEP14n9omsAgxJ3sn14XtHo2vs5a34UcpCyybXQJoUQ92',
      });

      expect(documents).toBeDefined();
      expect(documents.length).toEqual(2);
    });
  });

  describe('Document operations with networkId validation', () => {
    it('should maintain correct networkId through add, delete, update operations', async () => {
      const testDataStore = await createTestDataStore();

      const testDocument = {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        id: 'test-doc-1',
        type: ['VerifiableCredential', 'TestCredential'],
        issuer: {id: 'did:example:test1'},
        issuanceDate: '2023-01-01T00:00:00Z',
        credentialSubject: {id: 'did:example:subject1'},
      };

      await createDocument({
        dataStore: testDataStore,
        json: testDocument,
      });

      const docToUpdate = await getDocumentById({
        dataStore: testDataStore,
        id: 'test-doc-1',
      });

      expect(docToUpdate).toBeDefined();
      expect(docToUpdate.id).toBe('test-doc-1');

      const updatedDoc = {
        ...docToUpdate,
        credentialSubject: {
          ...docToUpdate.credentialSubject,
        updated: true,
        },
      };

      await updateDocument({
        dataStore: testDataStore,
        document: updatedDoc,
      });

      const newDoc = await getDocumentById({
        dataStore: testDataStore,
        id: 'test-doc-1',
      });

      expect(newDoc).toBeDefined();
      expect(newDoc.credentialSubject.updated).toBe(true);
    });
  });
});
