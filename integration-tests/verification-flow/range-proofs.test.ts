import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {
  closeWallet,
  getCredentialProvider,
  getWallet,
} from '../helpers/wallet-helpers';
import {createVerificationController} from '@docknetwork/wallet-sdk-core/src/verification-controller';
import {createProofRequest} from '../helpers/certs-helpers';
import axios from 'axios';
import {boundCheckSnarkKey} from './proof-requests';

describe('Range proofs verification', () => {
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
  });

  // TODO: The DID for this credential is not available anymore
  // Will need to create a new credential with the same schema and conditions
  it('should generate range proofs presentation using number max placeholder', async () => {
    const wallet: IWallet = await getWallet();
    const controller = await createVerificationController({
      wallet,
    });

    const credentialUrl =
      'https://creds-staging.truvera.io/8c668af5bd679cdb09af5df866c1da0c6732756fc96dd28236c87c9d2ad356ae';
    const password = '1234';
    const {data: credential} = await axios.get(
      `${credentialUrl}?p=${btoa(password)}`,
    );

    // debugger;

    await getCredentialProvider().addCredential(credential);

    await controller.start({
      template: 'https://creds-staging.truvera.io/proof/1c829d4e-029c-455d-935f-1ac5c1f53439',
      // {
      //   boundCheckSnarkKey,
      //   signature: null,
      //   qr: 'https://creds-testnet.truvera.io/proof/b8acdd33-e8e0-491f-8674-6ba521d9ea84',
      //   id: 'b8acdd33-e8e0-491f-8674-6ba521d9ea84',
      //   name: 'test data',
      //   nonce: '798b999c18bb83f0f9669aac91c68910',
      //   created: '2025-01-15T16:34:06.077Z',
      //   response_url:
      //     'https://api-testnet.truvera.io/proof-requests/b8acdd33-e8e0-491f-8674-6ba521d9ea84/send-presentation',
      //   request: {
      //     id: 'b8acdd33-e8e0-491f-8674-6ba521d9ea84',
      //     input_descriptors: [
      //       {
      //         id: 'Credential 1',
      //         name: 'test data',
      //         purpose: 'test',
      //         constraints: {
      //           fields: [
      //             {
      //               path: ['$.credentialSubject.id'],
      //               optional: false,
      //             },
      //             {
      //               path: ['$.credentialSubject.number'],
      //               filter: {
      //                 type: 'number',
      //                 exclusiveMinimum: 0,
      //               },
      //               optional: false,
      //               predicate: 'required',
      //             },
      //             {
      //               path: ['$.credentialSchema.id'],
      //               filter: {
      //                 const:
      //                   'https://schema.truvera.io/TestingCheqdSchema-V1-1736958567072.json',
      //               },
      //             },
      //             {
      //               path: ['$.credentialSubject.name'],
      //               optional: false,
      //             },
      //           ],
      //         },
      //       },
      //     ],
      //   },
      //   type: 'proof-request',
      // },
    });

    const attributesToReveal = [
      'credentialSubject.name',
      'credentialSubject.date',
      'credentialSubject.number',
    ];

    controller.selectedCredentials.set(credential.id, {
      credential: credential,
      attributesToReveal,
    });

    const presentation = await controller.createPresentation();

    // expect(
    //   presentation.verifiableCredential[0].credentialSubject,
    // ).toBeDefined();

    try {
      const result = await controller.submitPresentation(presentation);
    } catch (err) {
      debugger;
    }
  });

  afterAll(() => closeWallet());
});
