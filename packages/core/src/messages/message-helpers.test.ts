import {buildVerifiablePresentationMessage} from './message-helpers';

describe('message-helpers', () => {
  it('should build a verifiable presentation message from the holder to the verifier', () => {
    const message = buildVerifiablePresentationMessage({
      holderDID: 'holderDID',
      verifierDID: 'verifierDID',
      presentation: 'presentation',
      proofRequestId: 'proofRequestId',
    });

    expect(message.from).toBe('holderDID');
    expect(message.to).toBe('verifierDID');
  });
});
