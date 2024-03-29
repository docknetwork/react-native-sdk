import {
  createMessageProvider,
  IMessageProvider,
} from './../../core/src/message-provider';
import {createWallet, IWallet} from '@docknetwork/wallet-sdk-core/lib/wallet';
import {
  createCredentialProvider,
  ICredentialProvider,
} from '@docknetwork/wallet-sdk-core/src/credential-provider';
import {
  createDIDProvider,
  IDIDProvider,
} from '@docknetwork/wallet-sdk-core/src/did-provider';
import select from '@inquirer/select';

let wallet: IWallet;
let didProvider: IDIDProvider;
let credentialProvider: ICredentialProvider;
let messageProvider: IMessageProvider;

export async function getWallet(): Promise<IWallet> {
  if (!wallet) {
    wallet = await createWallet({
      databasePath: './wallet.db',
      dbType: 'sqlite',
      defaultNetwork: 'testnet',
    });

    wallet.setNetwork('testnet');

    didProvider = createDIDProvider({wallet});
    credentialProvider = createCredentialProvider({wallet});
    messageProvider = createMessageProvider({wallet, didProvider}) as any;
    await didProvider.ensureDID();
  }

  return wallet;
}

export function getMessageProvider(): IMessageProvider {
  return messageProvider;
}

export function getDIDProvider(): IDIDProvider {
  return didProvider;
}

export function getCredentialProvider(): ICredentialProvider {
  return credentialProvider;
}

export async function selectCredential() {
  const credentials = await credentialProvider.getCredentials();

  const selectedId = await select({
    message: 'Select a credential',
    choices: await Promise.all(
      credentials.map(async item => {
        const isBBS = await credentialProvider.isBBSPlusCredential(item);
        return {
          name: `Name: ${item.name}\n  Is BBS: ${
            isBBS ? 'Yes' : 'No'
          }\n  Type: ${JSON.stringify(item.type)}`,
          value: item.id,
          description: `Subject: ${JSON.stringify(item.credentialSubject)}`,
        };
      }),
    ),
  });

  return credentials.find(item => item.id === selectedId);
}
