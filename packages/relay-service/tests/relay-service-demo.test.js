import {RelayService} from '../lib';
import {ALICE_KEY_PAIR_DOC} from './mock-data';

const SessionMessage = {
  type: 'RelayServiceSession',
  from: ALICE_KEY_PAIR_DOC.controller,
  message: {
    presentation_definition: {
      id: 'first simple example',
      input_descriptors: [
        {
          id: 'A specific type of VC',
          name: 'A specific type of VC',
          purpose: 'We want a VC of this type',
          constraints: {
            fields: [
              {
                path: ['$.type'],
                filter: {
                  type: 'string',
                  pattern: '<the type of VC e.g. degree certificate>',
                },
              },
            ],
          },
        },
      ],
    },
  },
};

describe('Relay service DEMO', () => {
  test('Should send presentation request to wallet', async () => {
    await RelayService.sendMessage({
      keyPairDoc: ALICE_KEY_PAIR_DOC,
      message: SessionMessage,
      recipientDid: 'did:key:z6MkuFV745LpuAytwrUd9KjxqMrSG3TZiSUqqtVrQsU2gvhe',
    });
  });

//   test('BOB can fetch message sent by Alice', async () => {
//     const messages = await RelayService.getMessages({
//       keyPairDoc: BOB_KEY_PAIR_DOC,
//       limit: 20,
//     });

//     console.log('messages received');
//     console.log(messages);
//   });
});
