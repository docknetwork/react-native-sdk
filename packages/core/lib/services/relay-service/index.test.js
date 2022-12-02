import { mnemonicGenerate } from '@polkadot/util-crypto';
import { relayService } from '.';
import { NetworkManager } from '../../modules/network-manager';
import { keyringService } from '../keyring/service';
import { assertRpcService, getPromiseError } from '../test-utils';
import { validation, SendMessageParams, GetMessagesParams } from './configs';
import { relayService as service, relayServiceClient } from './service';
import { RelayServiceRpc } from './service-rpc';

describe('RelayService', () => {
  it('ServiceRpc', () => {
    assertRpcService(RelayServiceRpc, service, validation);
  });

  let accountDocuments;
  let testAccount;

  describe('service', () => {
    it('expect to getMessages using relayServiceClient', async () => {
      const mockResult = {
        success: true,
      };
      const getMessageMock = jest.spyOn(relayServiceClient, 'getMessages').mockImplementation(() => mockResult);
      const params: GetMessagesParams = { keyPairDoc: {}, limit: 10 };
      const result = await service.getMessages(params);

      expect(result).toBe(mockResult);
      expect(relayServiceClient.getMessages).toBeCalledWith(params);
      getMessageMock.mockClear();
    });

    it('expect to sendMessages using relayServiceClient', async () => {
      const mockResult = [
        {
          _id: '638a567a0562ef5792844699',
          to: 'did:key:z6MkhN7PBjWgSMQ24Bebdpvvw8fVRv7m6MHDqiwTKozzBgrJ',
          from: 'did:dock:5FoRVGjv9wJzH2X7sCewzvShAQh2LUUW73GU7Toe8DAswnVp',
          msg: 'Test message 1670010489278'
        }
      ];
      const sendMessageMock = jest.spyOn(relayServiceClient, 'sendMessage').mockImplementation(() => mockResult);
      const params: SendMessageParams = { keyPairDoc: {}, recipientDid: 'some-did', message: 'some-message' };
      const result = await service.sendMessage(params);

      expect(result).toBe(mockResult);
      expect(relayServiceClient.sendMessage).toBeCalledWith(params);

      sendMessageMock.mockClear();
    });
  })
});
