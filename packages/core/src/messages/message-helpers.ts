/**
 * DIDComm Message helpers
 * Check https://identity.foundation/didcomm-messaging/spec/#out-of-band-messages for more details
 */

export const MessageTypes = {
  Invitation: 'https://didcomm.org/out-of-band/2.0/invitation',
  RequestPresentation:
    'https://didcomm.org/present-proof/1.0/request-presentation',
  Presentation: 'https://didcomm.org/present-proof/1.0/presentation',
  Ack: 'https://didcomm.org/ack/1.0/ack',
  IssuerDirect: 'https://didcomm.org/issue-credential/2.0/issue-credential',
  Basic: 'https://didcomm.org/basicmessage/1.0/message',
  IssueWithData: 'https://didcomm.org/issue-credential/2.0/offer-credential',
};

export const Goals = {
  WalletToWalletVerification: 'wallet-to-wallet-verification',
  PresentationAckFromVerifier: 'presentation-ack-from-verifier',
};

/**
 *
 * @return OOB message to start a wallet to wallet verification flow
 * The holder will scan it as QR code and should have the context to start the verification flow
 *
 */
export function buildVerificationFlowInviteMessage({verifierDID, proofRequestId}) {
  return {
    type: MessageTypes.Invitation,
    from: verifierDID,
    body: {
      goal_code: Goals.WalletToWalletVerification,
      goal: 'Invite for a Wallet to Wallet Verification',
      proofRequestId: proofRequestId,
    },
  };
}

/**
 * Sender: Verifier
 * OOB message to request a verifiable presentation from the holder
 */
export function buildRequestVerifiablePresentationMessage({
  verifierDID,
  holderDID,
  proofRequest,
  proofRequestId
}) {
  return {
    type: MessageTypes.RequestPresentation,
    from: verifierDID,
    to: holderDID,
    body: {
      proofRequest,
      proofRequestId,
    },
  };
}

/**
 * Sender: Holder
 * Start a wallet to wallet verification flow
 */
export function buildAckWalletToWalletVerificationMessage({
  holderDID,
  verifierDID,
  proofRequestId,
}) {
  return {
    type: MessageTypes.Ack,
    from: holderDID,
    to: verifierDID,
    body: {
      goal_code: Goals.WalletToWalletVerification,
      goal: 'Ack for for a Wallet to Wallet Verification invite',
      proofRequestId: proofRequestId,
    },
  };
}


/**
 * Sender: Holder
 * Send a verifiable presentation to the verifier
 */
export function buildVerifiablePresentationMessage({
  verifierDID,
  holderDID,
  proofRequestId,
  presentation,
}) {
  return {
    type: MessageTypes.Presentation,
    from: holderDID,
    to: verifierDID,
    body: {
      proofRequestId,
      presentation,
    },
  };
}

/**
 * Sender: Verifier
 * Sends an the presentation result to the holder
 */
export function buildVerifiablePresentationAckMessage({
  verifierDID,
  holderDID,
  proofRequestId,
  presentationResult,
}) {
  return {
    type: MessageTypes.Ack,
    from: verifierDID,
    to: holderDID,
    body: {
      goal_code: Goals.PresentationAckFromVerifier,
      goal: 'Verifier is sending an Ack for a presentation sent by the holder',
      proofRequestId,
      presentationResult,
    },
  };
}
