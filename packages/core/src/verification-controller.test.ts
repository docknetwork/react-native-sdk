import {IWallet} from './types';
import {
  createVerificationController,
  VerificationStatus,
} from './verification-controller';
import {createWallet} from './wallet';
import customerCredentialJSON from './fixtures/customer-credential.json';
import {createDIDProvider, IDIDProvider} from './did-provider';
import {getDock} from '@docknetwork/wallet-sdk-wasm/src/services/dock/service';
import {Keyring} from '@polkadot/keyring';

describe('Verification provider', () => {
  let wallet: IWallet;
  let didProvider: IDIDProvider;

  const verificationTemplateJSON = {
    qr: 'https://creds-testnet.dock.io/proof/6de279ba-caf3-4979-a067-553284b40767',
    id: '6de279ba-caf3-4979-a067-553284b40767',
    name: 'Any credential',
    nonce: 'b75fab9a5006216173500bfd3df5d0c5',
    created: '2023-08-09T20:19:46.278Z',
    updated: '2023-08-09T20:19:46.278Z',
    verified: false,
    response_url:
      'https://api-testnet.dock.io/proof-requests/6de279ba-caf3-4979-a067-553284b40767/send-presentation',
    request: {
      id: '6de279ba-caf3-4979-a067-553284b40767',
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
    },
    type: 'proof-request',
  };

  beforeAll(async () => {
    wallet = await createWallet({
      databasePath: ':memory:',
    });

    getDock().keyring = new Keyring();

    didProvider = createDIDProvider({
      wallet,
    });

    await didProvider.ensureDID();

    await wallet.addDocument(customerCredentialJSON);
  });

  it('expect to create verification controller', async () => {
    const controller = createVerificationController({
      wallet,
    });

    await controller.start({
      template:
        'https://creds-testnet.dock.io/proof/6de279ba-caf3-4979-a067-553284b40767',
    });

    const currentDID = await didProvider.getAll();

    expect(controller.getSelectedDID()).toBe(currentDID[0].didDocument.id);
    expect(controller.getStatus()).toEqual(
      VerificationStatus.SelectingCredentials,
    );
    expect(controller.selectedCredentials.size).toEqual(0);
    expect(controller.getTemplateJSON()).toEqual(verificationTemplateJSON);
    expect(controller.getFilteredCredentials()).toEqual([
      customerCredentialJSON,
    ]);
  });

  it('expect to generate presentation for a selected credential', async () => {
    const controller = createVerificationController({
      wallet,
      didProvider,
    });

    await controller.start({
      template:
        'https://creds-testnet.dock.io/proof/6de279ba-caf3-4979-a067-553284b40767',
    });

    const credentials = controller.getFilteredCredentials();

    // select the first credential in the filtered list
    controller.selectedCredentials.set(credentials[0].id, {
      credential: credentials[0],
    });

    const presentation = await controller.createPresentation();

    expect(presentation.credentials[0]).toStrictEqual(credentials[0]);
    expect(presentation.type).toEqual(['VerifiablePresentation']);

    // validate the presentation
    const result = await controller.evaluatePresentation(presentation);

    expect(result.isValid).toBe(true);
  });

  it('expect to generate presentation for a bbs credential, selecting specific attributes to share', async () => {
    const controller = createVerificationController({
      wallet,
      didProvider,
    });

    await controller.start({
      template:
        'https://creds-testnet.dock.io/proof/6de279ba-caf3-4979-a067-553284b40767',
    });

    const credentials = controller.getFilteredCredentials();

    // select the first credential in the filtered list
    controller.selectedCredentials.set(credentials[0].id, {
      credential: credentials[0],
    });

    // set selected attributes

    const presentation = await controller.createPresentation();

    const result = await controller.evaluatePresentation(presentation);
    expect(result.isValid).toBe(true);
  });
});
