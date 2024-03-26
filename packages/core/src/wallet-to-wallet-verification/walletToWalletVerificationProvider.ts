import assert from 'assert';
import {IDIDProvider} from '../did-provider';
import {
  Goals,
  MessageTypes,
  ackWalletToWalletVerification,
  inviteHolderToVerificationFlow,
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
  return {
    getInvitationOOBMessage: async ({templateID}) => {
      const defaultDID = await didProvider.getDefaultDID();
      const template = await wallet.getDocumentById(templateID);

      assert(!!template, `Template with id ${templateID} not found`);

      return inviteHolderToVerificationFlow({
        templateID,
        verifierDID: defaultDID,
      });
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
    handleMessage: async (data: any) => {
      if (
        data.type === MessageTypes.Invitation &&
        data?.body?.goal_code === Goals.WalletToWalletVerification
      ) {
        // Received a verification invitation from the verifier
        // Sends back an ack message to the verifier
        const defaultDID = await didProvider.getDefaultDID();
        console.log(data);
        messageProvider.sendMessage(ackWalletToWalletVerification({
          holderDID: defaultDID,
          templateID: data.body.templateId,
          id: data.id,
          verifierDID: data.from,
        }));
        return true;
      }


    },
  };
}
