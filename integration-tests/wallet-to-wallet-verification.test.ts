import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {
  getWallet,
  getDIDProvider,
  getMessageProvider,
  closeWallet,
} from './helpers/wallet-helpers';
import {createWalletToWalletVerificationProvider} from '@docknetwork/wallet-sdk-core/src/wallet-to-wallet-verification/walletToWalletVerificationProvider';

import {IDIDProvider} from '@docknetwork/wallet-sdk-core/src/did-provider';
import {IMessageProvider} from '@docknetwork/wallet-sdk-core/src/message-provider';
import {
  Goals,
  MessageTypes,
} from '@docknetwork/wallet-sdk-core/src/messages/message-helpers';

const waitFor = ms => new Promise(r => setTimeout(r, ms));

describe('Wallet to Wallet Verification', () => {
  it('should get OOB message to be shared as QR code', async () => {
    const wallet: IWallet = await getWallet();
    const didProvider: IDIDProvider = getDIDProvider();
    const messageProvider: IMessageProvider = getMessageProvider();

    await messageProvider.clearCache();

    const verificationProvider = createWalletToWalletVerificationProvider({
      wallet,
      didProvider,
      messageProvider,
    });

    const templateJSON = {
      input_descriptors: [
        {
          id: 'Credential 1',
          name: 'Any credential',
          purpose: 'Any credential',
          constraints: {
            fields: [
              {
                path: ['$.id'],
              },
            ],
          },
        },
      ],
    };
    const createdDoc = await verificationProvider.addProofRequestTemplate(
      templateJSON,
    );
    const proofRequestTemplate = await wallet.getDocumentById(createdDoc.id);

    expect(proofRequestTemplate.id).toBeDefined();
    expect(proofRequestTemplate.template).toEqual(templateJSON);

    // Verifier generates a QR Code with the invitation
    const invitation = await verificationProvider.getInvitationOOBMessage({
      templateId: proofRequestTemplate.id,
    });

    // Holder scans the QR Code and sends an ack
    let messageHandlerResult = await verificationProvider.handleMessage(
      invitation,
    );

    expect(messageHandlerResult).toBe(true);

    const cancelAutoFetch = messageProvider.startAutoFetch();

    console.log('Verifier: Waiting for the ack message from the holder');
    const ackMessage = await messageProvider.waitForMessage();
    console.log(ackMessage);

    expect(ackMessage.type).toBe(MessageTypes.Ack);
    expect(ackMessage.body.goal_code).toBe(Goals.WalletToWalletVerification);

    console.log('Verifier: ack message received');
    console.log(
      'Verifier: handling ack and sending proof request to the holder',
    );
    messageHandlerResult = await verificationProvider.handleMessage(ackMessage);

    expect(messageHandlerResult).toBe(true);

    console.log('Holder: Waiting for proof request from the verifier');
    const proofRequestMessage = await messageProvider.waitForMessage();

    console.log('Holder: Proof Request Message received');
    console.log(proofRequestMessage);
    expect(proofRequestMessage.type).toBe(MessageTypes.RequestPresentation);
    expect(proofRequestMessage.body.proofRequestId).toEqual(
      proofRequestTemplate.id,
    );
    expect(proofRequestMessage.body.proofRequest).toEqual(templateJSON);


    verificationProvider.setProofRequestHandler((_proofRequest) => {
      // could render a UI to ask the user to provide the requested data
      console.log('Holder: Generating presentation');
      const presentation = {
        id: 'presentationId',
        type: 'Presentation',
        verifiableCredential: [
          {
            id: 'Credential 1',
            name: 'Any credential',
            purpose: 'Any credential',
          },
        ],
      };
      return presentation;
    });

    verificationProvider.handleMessage(proofRequestMessage);

    console.log('Verifier: Waiting for the presentation from the holder');
    const presentationMessage = await messageProvider.waitForMessage();

    expect(presentationMessage.type).toBe(MessageTypes.Presentation);
    console.log('Verifier: Presentation received');

    verificationProvider.setPresentationHandler((_presentation) => {
      // could render a UI to ask the user to verify the presentation
      console.log('Verifier: Verifying the presentation');
      return {
        verifier: true,
        message: 'Presentation verified',
      };
    });

    verificationProvider.handleMessage(presentationMessage);

    console.log('Holder: Waiting for the ack from the verifier');
    const ackPresentationMessage = await messageProvider.waitForMessage();

    expect(ackPresentationMessage.type).toBe(MessageTypes.Ack);
    expect(ackPresentationMessage.body.goal_code).toBe(
      Goals.PresentationAckFromVerifier,
    );
    console.log('Holder: Ack received');
    console.log(ackPresentationMessage);

    const presAckHandler = jest.fn();
    verificationProvider.setPresentationAckHandler(presAckHandler);


    verificationProvider.handleMessage(ackPresentationMessage);

    expect(presAckHandler).toBeCalled();
    expect(presAckHandler.mock.calls[0][0]).toEqual(ackPresentationMessage.body.presentationResult);

    cancelAutoFetch();

    await waitFor(3000);
  });

  afterAll(() => {
    return closeWallet();
  })
});
