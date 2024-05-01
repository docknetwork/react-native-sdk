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
import {logger} from '@docknetwork/wallet-sdk-data-store/src/logger';
import { EventEmitter } from 'events';

const ProofRequestTemplateType = 'ProofRequestTemplate';

export interface IWalletToWalletVerificationProvider {
  getInvitationOOBMessage: ({templateId}: {templateId: string}) => Promise<any>;
  setProofRequestHandler: (
    handler: (proofRequest: any) => any,
  ) => Promise<void>;
  setPresentationHandler: (
    handler: (presentation: any, proofRequest: any) => any,
  ) => Promise<void>;
  setPresentationAckHandler: (
    handler: (proofRequest: any) => any,
  ) => Promise<void>;
  addProofRequestTemplate: (proofRequestTemplate: any) => Promise<any>;
  getProofRequestTemplates: () => Promise<any[]>;
  handleMessage: (message: any) => Promise<boolean>;
  eventEmitter: EventEmitter;
}

export const Events = {
  VerifierFlowStarted: 'VerifierFlowStarted',
  HolderFlowStarted: 'HolderFlowStarted',
}

export function createWalletToWalletVerificationProvider({
  wallet,
  didProvider,
  messageProvider,
}: {
  wallet: IWallet;
  didProvider: IDIDProvider;
  messageProvider: IMessageProvider;
}): IWalletToWalletVerificationProvider {
  // Should be used by the HOLDER to create a presentation for the verifier
  let proofRequestHandler;
  // Should be used by the VERIFIER verify a presentation received by the holder
  let presentationHandler;
  // Can be used by the HOLDER to render the verification results sent by the verifier
  let presentationAckHandler;

  const eventEmitter = new EventEmitter();

  return {
    eventEmitter,
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
    setPresentationHandler: async (handler: (presentation: any, proofRequest: any) => any) => {
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
      logger.debug('Received message');
      logger.debug(message);
      if (
        message.type === MessageTypes.Invitation &&
        message?.body?.goal_code === Goals.WalletToWalletVerification
      ) {
        // Received a verification invitation from the verifier
        // Sends back an ack message to the verifier
        const defaultDID = await didProvider.getDefaultDID();
        logger.debug('Received invitation');
        logger.debug('Sending ack message to the verifier');
        messageProvider.sendMessage(
          buildAckWalletToWalletVerificationMessage({
            holderDID: defaultDID,
            proofRequestId: message.body.proofRequestId,
            verifierDID: message.from,
          }),
        );

        eventEmitter.emit(Events.HolderFlowStarted);

        return true;
      }

      // The holder sent an ack message to the verifier invite
      // Now the verifier knows the holder did and can offer a proof request
      if (
        message.type === MessageTypes.Ack &&
        message?.body?.goal_code === Goals.WalletToWalletVerification
      ) {
        async function process() {
          logger.debug(message);
          const templateId = message.body.proofRequestId;
          assert(!!templateId, 'Template ID not found in ack message');
          const defaultDID = await didProvider.getDefaultDID();
          const proofRequestTemplate = await wallet.getDocumentById(templateId);

          assert(!!proofRequestTemplate, 'Proof request template not found');

          logger.debug('Sending proof request to the holder');

          const proofRequest = proofRequestTemplate.template;

          assert(!!proofRequest, 'Proof request not found');

          messageProvider.sendMessage(
            buildRequestVerifiablePresentationMessage({
              proofRequestId: templateId,
              proofRequest: proofRequestTemplate.template,
              holderDID: message.from,
              verifierDID: defaultDID,
            }),
          );

          eventEmitter.emit(Events.VerifierFlowStarted);
        }

        process();

        return true;
      }

      // The holder received a proof request from the verifier
      if (message.type === MessageTypes.RequestPresentation) {
        logger.debug('Received proof request from the verifier');

        assert(!!proofRequestHandler, 'No proof request handler set');

        logger.debug(
          'Waiting for proofRequest handler to return a presentation',
        );
        Promise.resolve(proofRequestHandler(message.body.proofRequest)).then(
          async presentation => {
            logger.debug('Presentation received from handler');
            const defaultDID = await didProvider.getDefaultDID();
            logger.debug('Sending presentation to the verifier');
            messageProvider.sendMessage(
              buildVerifiablePresentationMessage({
                holderDID: defaultDID,
                presentation,
                proofRequestId: message.body.proofRequestId,
                verifierDID: message.from,
              }),
            );
          },
        );

        return true;
      }

      // The verifier received a presentation from the holder
      if (message.type === MessageTypes.Presentation) {
        logger.debug('Received presentation from the holder');

        const proofRequestTemplate = await wallet.getDocumentById(message.body.proofRequestId);
        const proofRequest = proofRequestTemplate?.template;

        assert(!!proofRequest, 'Proof request template not found');

        logger.debug(
          'Waiting for presentation handler to return a presentation',
        );
        assert(!!presentationHandler, 'No presentation handler set');
        
        Promise.resolve(presentationHandler(message.body.presentation, proofRequest)).then(
          async presentationResult => {
            const defaultDID = await didProvider.getDefaultDID();
            logger.debug('Sending presentation ack to the holder');
            messageProvider.sendMessage(
              buildVerifiablePresentationAckMessage({
                holderDID: message.from,
                presentationResult,
                proofRequestId: message.body.proofRequestId,
                verifierDID: defaultDID,
              }),
            );
          },
        );

        return true;
      }

      // The holder received a presentation ack from the verifier
      if (
        message.type === MessageTypes.Ack &&
        message.body.goal_code === Goals.PresentationAckFromVerifier
      ) {
        logger.debug('Received presentation ack from the verifier');
        logger.debug('Presentation ack received');
        if (presentationAckHandler) {
          presentationAckHandler(message.body.presentationResult);
        }
        return true;
      }
    },
  };
}
