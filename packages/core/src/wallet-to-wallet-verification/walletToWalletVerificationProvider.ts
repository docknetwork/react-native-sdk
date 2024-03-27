import assert from 'assert';
import {IDIDProvider} from '../did-provider';
import {
  Goals,
  MessageTypes,
  buildAckWalletToWalletVerificationMessage,
  buildVerificationFlowInviteMessage,
  buildRequestVerifiablePresentationMessage,
  buildVerifiablePresentationAckMessage,
  buildVerifiablePresentationMessage,
} from '../messages/message-helpers';
import {IWallet} from '../types';
import {IMessageProvider} from '../message-provider';

const ProofRequestTemplateType = 'ProofRequestTemplate';

export function createWalletToWalletVerificationProvider({
  wallet,
  didProvider,
  messageProvider,
}: {
  wallet: IWallet;
  didProvider: IDIDProvider;
  messageProvider: IMessageProvider;
}) {
  // Should be used by the HOLDER to create a presentation for the verifier
  let proofRequestHandler;
  // Should be used by the VERIFIER verify a presentation received by the holder
  let presentationHandler;
  // Can be used by the HOLDER to render the verification results sent by the verifier
  let presentationAckHandler;

  return {
    getInvitationOOBMessage: async ({templateId}) => {
      const defaultDID = await didProvider.getDefaultDID();
      const template = await wallet.getDocumentById(templateId);

      assert(!!template, `Template with id ${templateId} not found`);

      return buildVerificationFlowInviteMessage({
        proofRequestId: templateId,
        verifierDID: defaultDID,
      });
    },
    setProofRequestHandler: async (handler: (proofRequest: any) => any) => {
      proofRequestHandler = handler;
    },
    setPresentationHandler: async (handler: (proofRequest: any) => any) => {
      presentationHandler = handler;
    },
    setPresentationAckHandler: async (handler: (proofRequest: any) => any) => {
      presentationAckHandler = handler;
    },
    addProofRequestTemplate: async (proofRequestTemplate: any) => {
      assert(
        !!proofRequestTemplate.input_descriptors,
        'Input descriptions are required',
      );
      return wallet.addDocument({
        type: ProofRequestTemplateType,
        template: proofRequestTemplate,
      });
    },
    getProofRequestTemplates: async () => {
      return wallet.getDocumentsByType(ProofRequestTemplateType);
    },
    handleMessage: async (message: any) => {
      if (
        message.type === MessageTypes.Invitation &&
        message?.body?.goal_code === Goals.WalletToWalletVerification
      ) {
        // Received a verification invitation from the verifier
        // Sends back an ack message to the verifier
        const defaultDID = await didProvider.getDefaultDID();
        console.log('Received invitation');
        console.log('Sending ack message to the verifier');
        messageProvider.sendMessage(
          buildAckWalletToWalletVerificationMessage({
            holderDID: defaultDID,
            proofRequestId: message.body.proofRequestId,
            verifierDID: message.from,
          }),
        );
        return true;
      }

      // The holder sent an ack message to the verifier invite
      // Now the verifier knows the holder did and can offer a proof request
      if (
        message.type === MessageTypes.Ack &&
        message?.body?.goal_code === Goals.WalletToWalletVerification
      ) {
        console.log(message);
        const templateId = message.body.proofRequestId;
        assert(!!templateId, 'Template ID not found in ack message');
        const defaultDID = await didProvider.getDefaultDID();
        const proofRequestTemplate = await wallet.getDocumentById(templateId);

        console.log('Sending proof request to the holder');
        messageProvider.sendMessage(
          buildRequestVerifiablePresentationMessage({
            proofRequestId: templateId,
            proofRequest: proofRequestTemplate.template,
            holderDID: message.from,
            verifierDID: defaultDID,
          }),
        );

        return true;
      }

      if (message.type === MessageTypes.RequestPresentation) {
        console.log('Received proof request from the verifier');
        console.log(
          'Waiting for proofRequest handler to return a presentation',
        );
        const presentation = await proofRequestHandler(
          message.body.proofRequest,
        );
        console.log('Presentation received from handler');
        const defaultDID = await didProvider.getDefaultDID();
        console.log('Sending presentation to the verifier');
        messageProvider.sendMessage(buildVerifiablePresentationMessage({
          holderDID: defaultDID,
          presentation,
          proofRequestId: message.body.proofRequestId,
          verifierDID: message.from,
        }));
        return true;
      }

      if (message.type === MessageTypes.Presentation) {
        console.log('Received presentation from the holder');
        console.log(
          'Waiting for presentation handler to return a presentation',
        );
        const presentationResult = await presentationHandler(message.body.presentation);
        console.log('Presentation received from handler');
        const defaultDID = await didProvider.getDefaultDID();
        console.log('Sending presentation to the holder');
        messageProvider.sendMessage(buildVerifiablePresentationAckMessage({
          holderDID: message.from,
          presentationResult,
          proofRequestId: message.body.proofRequestId,
          verifierDID: defaultDID,
        }));
      }

      if (message.type === MessageTypes.Ack && message.body.goal_code === Goals.PresentationAckFromVerifier) {
        console.log('Received presentation ack from the verifier');
        console.log('Presentation ack received');
        presentationAckHandler(message.body.presentationResult);
        return true;
      }
    },
  };
}
