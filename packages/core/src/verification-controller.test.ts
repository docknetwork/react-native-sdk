import {IWallet} from './types';
import {createVerificationController} from './verification-controller';
import {createWallet} from './wallet';
import customerCredentialJSON from './fixtures/customer-credential.json';
import {createDIDProvider, IDIDProvider} from './did-provider';

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

    expect(controller.getSelectedDID()).toBe(currentDID[0].id);
    expect(controller.getSelectedAttributes()).toEqual([]);
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
    controller.setSelectedCredentialIds([credentials[0].id]);

    const presentation = await controller.createPresentation();

    expect(presentation).toEqual([]);
  });
});
