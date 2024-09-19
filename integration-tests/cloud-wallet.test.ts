import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {
  closeWallet,
  createNewWallet,
} from './helpers/wallet-helpers';
import {
  DataStore,
} from '@docknetwork/wallet-sdk-data-store/src/types';
import {
  SYNC_MARKER_TYPE,
  initializeCloudWallet,
} from '@docknetwork/wallet-sdk-core/src/cloud-wallet';
import {createDataStore} from '@docknetwork/wallet-sdk-data-store-typeorm/src';

const EDV_URL = process.env.EDV_URL;

const agreementKey = {
  '@context': ['https://w3id.org/wallet/v1'],
  type: 'X25519KeyAgreementKey2020',
  id: 'did:key:z6LSqN54mGZqf99ptTHyB3WWpwnrs25uAMrUgWsZiSLCdSDP#z6LSqN54mGZqf99ptTHyB3WWpwnrs25uAMrUgWsZiSLCdSDP',
  controller: 'did:key:z6LSqN54mGZqf99ptTHyB3WWpwnrs25uAMrUgWsZiSLCdSDP',
  publicKeyMultibase: 'z6LSqN54mGZqf99ptTHyB3WWpwnrs25uAMrUgWsZiSLCdSDP',
  privateKeyMultibase: 'z3weecLZfDoMXCvQYUpvjTdvnw9g5zjRmh7eErSpJQwQjCar',
};

const verificationKey = {
  '@context': ['https://w3id.org/wallet/v1'],
  id: 'did:key:z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r#z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r',
  name: 'My Test Key 2',
  image: 'https://via.placeholder.com/150',
  description: 'For testing only, totally compromised.',
  tags: ['professional', 'organization', 'compromised'],
  correlation: ['4058a72a-9523-11ea-bb37-0242ac130002'],
  controller: 'did:key:z6MkjjCpsoQrwnEmqHzLdxWowXk5gjbwor4urC1RPDmGeV8r',
  type: 'Ed25519VerificationKey2018',
  privateKeyBase58:
    '3CQCBKF3Mf1tU5q1FLpHpbxYrNYxLiZk4adDtfyPEfc39Wk6gsTb2qoc1ZtpqzJYdM1rG4gpaD3ZVKdkiDrkLF1p',
  publicKeyBase58: '6GwnHZARcEkJio9dxPYy6SC5sAL6PxpZAB6VYwoFjGMU',
};

const hmacKey =
  'T4TUcRii3XOf8gwq37_MiCfUKCY074xRo2FCy-rZyXxmD_NPrALuMdWxFE91j7ZoqRUm6tUrq3LJGiRYWRGgLw';

describe('Cloud wallet', () => {
  let dataStore: DataStore;
  let storageInterface: any;
  let waitForEdvIdle: any;
  let pushSyncMarker: any;
  let findDocumentByContentId: any;
  let updateDocumentByContentId: any;
  let pullDocuments: any;
  let getSyncMarkerDiff: any;
  let clearEdvDocuments: any;
  let wallet: IWallet;

  beforeAll(async () => {
    dataStore = await createDataStore({
      databasePath: ':memory:',
      dbType: 'sqlite',
      defaultNetwork: 'testnet',
    });

    ({
      storageInterface,
      waitForEdvIdle,
      pushSyncMarker,
      findDocumentByContentId,
      updateDocumentByContentId,
      pullDocuments,
      getSyncMarkerDiff,
      clearEdvDocuments,
    } = await initializeCloudWallet({
      dataStore,
      edvUrl: EDV_URL,
      agreementKey,
      verificationKey,
      hmacKey,
    }));

    await clearEdvDocuments();

    wallet = await createNewWallet({
      dontWaitForNetwork: true,
      otherProps: {
        dataStore,
      },
    });
  });

  it('should see a document added directly to the EDV appear in the wallet after pulling', async () => {
    const newDocId = `${Date.now()}`;
    const newDoc = {
      id: newDocId,
      type: 'test',
      data: 'test',
    };

    await storageInterface.insert({
      document: {
        content: newDoc,
      },
    });

    await pullDocuments();

    const sdkDocument = await wallet.getDocumentById(newDocId);
    expect(sdkDocument).toEqual(newDoc);
  });

  it('should sync a document added to the wallet to the EDV', async () => {
    const doc = {
      type: 'test',
      data: 'test',
    };
    const {id: addedDocId} = await wallet.addDocument(doc);

    await waitForEdvIdle();

    const edvDocument = await findDocumentByContentId(addedDocId);
    expect(edvDocument.content.id).toBe(addedDocId);
  });

  it('should update a document in the wallet and see it updated in the EDV', async () => {
    const doc = {
      type: 'test',
      data: 'test',
    };
    const {id: addedDocId} = await wallet.addDocument(doc);

    await waitForEdvIdle();

    await wallet.updateDocument({
      id: addedDocId,
      ...doc,
      data: 'updated',
    });

    await waitForEdvIdle();

    const updatedEdvDocument = await findDocumentByContentId(addedDocId);
    expect(updatedEdvDocument.content.data).toBe('updated');
  });

  it('should remove a document from the wallet and see it removed from the EDV', async () => {
    const doc = {
      type: 'test',
      data: 'test',
    };
    const {id: addedDocId} = await wallet.addDocument(doc);

    await waitForEdvIdle();

    await wallet.removeDocument(addedDocId);

    await waitForEdvIdle();

    const removedEdvDocument = await findDocumentByContentId(addedDocId);
    expect(removedEdvDocument).toBeUndefined();
  });

  it('should have zero sync marker diff after pushing sync marker', async () => {
    await pushSyncMarker();
    await waitForEdvIdle();

    const syncMarkerDiff = await getSyncMarkerDiff();
    expect(syncMarkerDiff).toBe(0);
  });

  it('should detect sync marker diff after updating sync marker directly in EDV', async () => {
    await updateDocumentByContentId({
      id: SYNC_MARKER_TYPE,
      type: SYNC_MARKER_TYPE,
      updatedAt: Date.now() + 1000,
    });

    const syncMarkerDiff = await getSyncMarkerDiff();
    expect(syncMarkerDiff > 0).toBeTruthy();
  });

  afterAll(() => closeWallet());
});
