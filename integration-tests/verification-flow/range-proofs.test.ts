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
  it('should verify range proofs presentation without subject', async () => {
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

    const proofRequest = await createProofRequest(
      'db3ca660-f353-4298-8522-73ef95ea1a16',
    );

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

    const result = await controller.submitPresentation(presentation);
    expect(result.verified).toBe(true);
  });

  afterAll(() => closeWallet());
});
