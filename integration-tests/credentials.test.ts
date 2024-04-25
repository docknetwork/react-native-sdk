import {
  getCredentialById,
  importCredentialJSON,
} from './helpers/credential-helpers';
import {
  BasicCredential,
  PolygonIDCredential,
  UniversityDegreeCredential,
  UniversityDegreeCredentialBBS,
  BasicCredentialMainnet,
  UniversityDegreeTestnet,
} from './data/credentials';
import {
  cleanup,
  closeWallet,
  createNewWallet,
  getCredentialProvider,
  getWallet,
  setupEnvironent,
} from './helpers';
import {credentialService} from '@docknetwork/wallet-sdk-wasm/src/services/credential/service';
import {IWallet} from '@docknetwork/wallet-sdk-core/src/types';
import {WalletEvents} from '@docknetwork/wallet-sdk-wasm/src/modules/wallet';
import {API_MOCK_DISABLED} from '@docknetwork/wallet-sdk-wasm/src/services/test-utils';

const allCredentials = [
  BasicCredential,
  UniversityDegreeCredential,
  UniversityDegreeCredentialBBS,
  PolygonIDCredential,
];

describe('Credentials', () => {
  let wallet;
  beforeEach(async () => {
    await cleanup();
    await setupEnvironent();
    await createNewWallet();
    wallet = await getWallet();
  });

  it('expect to import credentials', async () => {
    for (const credentialJSON of allCredentials) {
      await importCredentialJSON(credentialJSON);
      const credential = await getCredentialById(credentialJSON.id);
      expect(credential).toBeDefined();
    }
  });

  it('should import an OpenBadgeCredential', async () => {
    (await getWallet()).setNetwork('mainnet');
    await getCredentialProvider().addCredential({
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json',
        'https://w3id.org/security/suites/ed25519-2020/v1',
      ],
      type: ['VerifiableCredential', 'OpenBadgeCredential'],
      issuer: {
        type: 'Profile',
        id: 'did:key:z6MkoowWdLogChc6mRp18YcKBd2yYTNnQLeHdiT73wjL1h6z',
        name: 'Trusted Learner Network (TLN) Unconference Issuer',
        url: 'https://tln.asu.edu/',
        image: {
          id: 'https://plugfest3-assets-20230928.s3.amazonaws.com/TLN+Gold+Circle.png',
          type: 'Image',
        },
      },
      issuanceDate: '2024-04-04T16:43:31.485Z',
      name: '2024 TLN Unconference Change Agent',
      credentialSubject: {
        type: 'AchievementSubject',
        id: 'did:key:7af28a8b2b9684073a0884aacd8c31eb5908baf4a1ba7e2ca60582bf585c68ad',
        achievement: {
          id: 'https://tln.asu.edu/achievement/369435906932948',
          type: 'Achievement',
          name: '2024 TLN Unconference Change Agent',
          description:
            'This credential certifies attendance, participation, and knowledge-sharing at the 2024 Trusted Learner Network (TLN) Unconference.',
          criteria: {
            type: 'Criteria',
            narrative:
              "* Demonstrates initiative and passion for digital credentialing\n* Shares knowledge, skills and experience to broaden and deepen the community's collective understanding and competency\n* Engages in complex problems by collaborating with others\n* Creates connections and builds coalition to advance the ecosystem",
          },
        },
      },
      id: 'https://tln.asu.edu/achievement/369435906932948',
      proof: {
        type: 'Ed25519Signature2020',
        created: '2024-04-04T16:43:31Z',
        verificationMethod:
          'did:key:z6MkoowWdLogChc6mRp18YcKBd2yYTNnQLeHdiT73wjL1h6z#z6MkoowWdLogChc6mRp18YcKBd2yYTNnQLeHdiT73wjL1h6z',
        proofPurpose: 'assertionMethod',
        proofValue:
          'z23JQwSmJKnWXw1HWDMBv1yoZDVyfUsRWihQFsrSLpb8cENqbuqpdnaSY72VmCkY3WQ4GovpNRZPNLRaatXeDJE8G',
      },
    });

    const credential = await getCredentialProvider().getById('https://tln.asu.edu/achievement/369435906932948');
    expect(credential).toBeDefined();
    const credentialStatus = await getCredentialProvider().isValid(credential);
    // This credential is invalid
    console.log(credentialStatus);

  });

  describe('credential status', () => {
    // TODO: Fix this test
    // it('expect testnet credential to have "Valid" status', async () => {
    //   // There is a ticket to remove the API mock and spinup a substrate node for integration tests in CI
    //   // For now these tests can be used for local testing, as it depends on the live APIs
    //   if (!API_MOCK_DISABLED) {
    //     return;
    //   }

    //   await wallet.setNetwork('testnet');
    //   const result = await credentialService.verifyCredential({
    //     credential: UniversityDegreeCredential,
    //   });

    //   expect(result.verified).toBeTruthy();
    // });

    it('expect mainnet credential to have "Invalid" status on tesnet', async () => {
      if (!API_MOCK_DISABLED) {
        return;
      }

      await wallet.setNetwork('testnet');
      const result = await credentialService.verifyCredential({
        credential: BasicCredentialMainnet,
      });

      expect(result.verified).toBeFalsy();
    });
    // TODO: Fix this test
    // it('expect to switch network from testnet to mainnet and get valid status on mainnet credential', async () => {
    //   if (!API_MOCK_DISABLED) {
    //     return;
    //   }

    //   // the default network is testnet
    //   // switch to mainnet
    //   await wallet.setNetwork('mainnet');

    //   // Wait for network to be updated
    //   await new Promise(resolve => {
    //     wallet.eventManager.on(WalletEvents.networkConnected, resolve);
    //   });

    //   const result = await credentialService.verifyCredential({
    //     credential: BasicCredentialMainnet,
    //   });

    //   expect(result.verified).toBeTruthy();
    // });
  });

  afterAll(() => closeWallet());
});
