import {RelayService} from '../lib';
import {BOB_KEY_PAIR_DOC} from './mock-data';

const PresentationDefinition = {
  presentation_definition: {
    id: 'Wallet to wallet DEMO (testing once again)',
    input_descriptors: [
      {
        id: 'A UniversityDegree VC',
        name: 'A UniversityDegree VC',
        purpose: 'Wallet to wallet DEMO (testing once again)',
        constraints: {
          fields: [
            {
              path: ['$.type[*]'],
              filter: {type: 'string', pattern: 'UniversityDegree'},
            },
          ],
        },
      },
    ],
  },
};

const VerificationResult = {verification_result: {verified: false}};

describe('Relay service DEMO', () => {
  test('Should send presentation request to wallet', async () => {
    await RelayService.sendMessage({
      keyPairDoc: BOB_KEY_PAIR_DOC,
      message: JSON.stringify(PresentationDefinition),
      recipientDid: 'did:key:z6MkuFV745LpuAytwrUd9KjxqMrSG3TZiSUqqtVrQsU2gvhe',
    });
  });

    // test('BOB can fetch message sent by Alice', async () => {
    //   const messages = await RelayService.getMessages({
    //     keyPairDoc: BOB_KEY_PAIR_DOC,
    //     limit: 20,
    //   });

    //   console.log('messages received');
    //   console.log(messages);
    // });
});
