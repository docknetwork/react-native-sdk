import {IDIDProvider, createDIDProvider} from './did-provider';
import {IMessageProvider, createMessageProvider} from './message-provider';
import {IWallet, createWallet} from './wallet';

describe('MessageProvider', () => {
  let messageProvider: IMessageProvider;
  let wallet: IWallet;
  let didProvider: IDIDProvider;
  let relayService: any;
  let didCommMessages = [
    {
      _id: '651e965410fc3fcfffdd17f1',
      to: 'did:key:z6MkoQzWru66w91EH7U9Xsv5eYXQabw9U3ZJd5GkatMWkmZT',
      from: 'did:key:z6MkoQzWru66w91EH7U9Xsv5eYXQabw9U3ZJd5GkatMWkmZT',
      msg: '<encrypted-message>',
    },
    {
      _id: '951e965410fc3fcfffdd17f1',
      to: 'did:key:z6MkoQzWru66w91EH7U9Xsv5eYXQabw9U3ZJd5GkatMWkmZT',
      from: 'did:key:z6MkoQzWru66w91EH7U9Xsv5eYXQabw9U3ZJd5GkatMWkmZT',
      msg: '<encrypted-message>',
    },
  ];

  beforeEach(async () => {
    relayService = {
      sendMessage: jest.fn(),
      getMessages: jest.fn().mockResolvedValue(didCommMessages),
      resolveDidcommMessage: jest.fn().mockImplementation(({ encryptedMessage }) => encryptedMessage),
    };

    wallet = await createWallet({
      databasePath: ':memory:',
    });
    didProvider = createDIDProvider({
      wallet,
    });
    messageProvider = createMessageProvider({
      wallet,
      didProvider,
      relayService,
    });
  });

  it('should fetch messages and store encrypted data in the wallet', async () => {
    const messages = await messageProvider.fetchMessages();
    expect(messages).toEqual(didCommMessages);

    for(let message of didCommMessages) {
      const walletMessage = await wallet.getDocumentById(message._id);
      expect(walletMessage.encryptedMessage).toEqual(message);
    }
  });

  it('should decrypt encrypted messages in the wallet', async () => {
    jest.spyOn(wallet.eventManager, 'emit').mockReset();

    await messageProvider.fetchMessages()
    await messageProvider.processDIDCommMessages();

    expect(wallet.eventManager.emit).toHaveBeenCalledWith('didcomm-messages-received', didCommMessages);
    expect(wallet.eventManager.emit).toHaveBeenCalledWith('didcomm-message-decrypted', didCommMessages[0]);
  });


  it('should handle errors when fetching messages', async () => {
    relayService.getMessages.mockRejectedValue(new Error('Fetching failed'));
    
    await expect(messageProvider.fetchMessages()).rejects.toThrow('Failed to fetch messages: Fetching failed');
  });

  it('should handle errors when sending messages', async () => {
    relayService.sendMessage.mockRejectedValue(new Error('Sending failed'));
    
    await expect(
      messageProvider.sendMessage({
        did: 'someDid',
        message: 'someMessage',
        recipientDid: 'recipientDid',
      })
    ).rejects.toThrow('Failed to send message: Sending failed');
  });

  it('should handle errors when processing DIDComm messages', async () => {
    relayService.resolveDidcommMessage.mockRejectedValue(new Error('Decryption failed'));
    
    await expect(messageProvider.processDIDCommMessages()).rejects.toThrow('Failed to process DIDComm messages: Decryption failed');
  });

  it('should handle errors when marking messages as read', async () => {
    wallet.removeDocument = jest.fn().mockRejectedValue(new Error('Removal failed'));
    
    await expect(messageProvider.markMessageAsRead('someId')).rejects.toThrow('Failed to mark message as read: Removal failed');
  });
});
