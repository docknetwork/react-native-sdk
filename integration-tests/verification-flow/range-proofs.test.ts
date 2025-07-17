import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {
  closeWallet,
  getCredentialProvider,
  getWallet,
} from '../helpers/wallet-helpers';
import {createVerificationController} from '@docknetwork/wallet-sdk-core/src/verification-controller';
import {createProofRequest} from '../helpers/certs-helpers';
import axios from 'axios';

describe('Range proofs verification', () => {
  let proofRequest: any;

  beforeAll(async () => {
    proofRequest = await createProofRequest(
      'db3ca660-f353-4298-8522-73ef95ea1a16',
    );
  });
  it('should create range proofs presentation without subject', async () => {
    const wallet: IWallet = await getWallet();
    const controller = await createVerificationController({
      wallet,
    });

    const credentialUrl =
      'https://creds-testnet.dock.io/697fe144364680179937fa748a5b2483f3ee2743ab751cbad8305338eb53a7a3';
    const password = '1234';
    const {data: credential} = await axios.get(
      `${credentialUrl}?p=${btoa(password)}`,
    );

    getCredentialProvider().addCredential(credential);

    await controller.start({
      template: proofRequest.qr,
    });

    // Reveal only dateOfBirth attribute
    const attributesToReveal = ['credentialSubject.dateOfBirth'];

    controller.selectedCredentials.set(credential.id, {
      credential: credential,
      attributesToReveal,
    });

    const presentation = await controller.createPresentation();

    // presentation should not have subject revealed
    expect(
      presentation.verifiableCredential[0].credentialSubject,
    ).toBeUndefined();
  });

  it('should not reveal range proof attributes for KVAC credentials', async () => {
    const wallet: IWallet = await getWallet();
    const controller = await createVerificationController({
      wallet,
    });

    const credentialUrl =
      'https://creds-testnet.truvera.io/16c431993e6678af4fc74a9b995250bfe3a2ecf215baa31f0945164ac89fd798';
    const password = 'test';
    const {data: credential} = await axios.get(
      `${credentialUrl}?p=${btoa(password)}`,
    );

    getCredentialProvider().addCredential(credential);

    await controller.start({
      template: proofRequest.qr,
    });

    // Reveal only dateOfBirth attribute
    const attributesToReveal = [
      'credentialSubject.id',
      'credentialSubject.dateOfBirth',
    ];

    controller.selectedCredentials.set(credential.id, {
      credential: credential,
      attributesToReveal,
    });

    const presentation = await controller.createPresentation();

    // presentation should not have dateOfBirth revealed
    expect(
      presentation.verifiableCredential[0].credentialSubject.dateOfBirth,
    ).toBeUndefined();
    expect(
      presentation.verifiableCredential[0].credentialSubject.id,
    ).toBeDefined();
  });
  afterAll(() => closeWallet());
});
