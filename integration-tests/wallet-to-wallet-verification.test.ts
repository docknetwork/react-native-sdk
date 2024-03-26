import {IWallet} from '@docknetwork/wallet-sdk-core/lib/types';
import {
  getWallet,
  getDIDProvider,
  getMessageProvider,
} from './helpers/wallet-helpers';
import {createWalletToWalletVerificationProvider} from '@docknetwork/wallet-sdk-core/src/wallet-to-wallet-verification/walletToWalletVerificationProvider';

import {IDIDProvider} from '@docknetwork/wallet-sdk-core/src/did-provider';
import {IMessageProvider} from '@docknetwork/wallet-sdk-core/src/message-provider';



// function waitForMessages({ messageProvider }) {
//   return new Promise((resolve) => {
//     messageProvider.on
//   });
// }
const waitFor = (ms) => new Promise((r) => setTimeout(r, ms));

describe('Wallet to Wallet Verification', () => {
  it('should get OOB message to be shared as QR code', async () => {
    const wallet: IWallet = await getWallet();
    const didProvider: IDIDProvider = getDIDProvider();
    const messageProvider: IMessageProvider = getMessageProvider();

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
      templateID: proofRequestTemplate.id,
    });

    // Holder scans the QR Code and sends an ack
    let messageHandlerResult = await verificationProvider.handleMessage(invitation);

    expect(messageHandlerResult).toBe(true);

    messageProvider.startAutoFetch();
    let message = await messageProvider.waitForMessage();
    

    console.log(message);

    await waitFor(3000);
  });
});
