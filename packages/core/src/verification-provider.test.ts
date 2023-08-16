import {IWallet} from './types';
import {createVerificationProvider} from './verification-provider';
import {createWallet} from './wallet';
import customerCredentialJSON from './fixtures/customer-credential.json';

describe('Verification provider', () => {
  let verificationProvider;
  let wallet: IWallet;
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

    await wallet.addDocument(customerCredentialJSON);

    verificationProvider = createVerificationProvider({
      wallet,
    });
  });

  it('expect to create verification controller and fetch template JSON', async () => {
    const controller = await verificationProvider.start({
      template:
        'https://creds-testnet.dock.io/proof/6de279ba-caf3-4979-a067-553284b40767',
    });

    expect(controller.getTemplateJSON()).toEqual(verificationTemplateJSON);
  });

  it('expect to load credentials for a given template', async () => {
    const controller = await verificationProvider.start({
      template:
        'https://creds-testnet.dock.io/proof/6de279ba-caf3-4979-a067-553284b40767',
    });

    await controller.loadCredentials();

    expect(controller.getFilteredCredentials()).toEqual([
      customerCredentialJSON,
    ]);
  });

  it('expect to load credentials and generate presentation for a selected credential', async () => {
    const controller = await verificationProvider.start({
      template:
        'https://creds-testnet.dock.io/proof/6de279ba-caf3-4979-a067-553284b40767',
    });

    await controller.loadCredentials();
    const credentials = controller.getFilteredCredentials();

    // select the first credential in the filtered list
    controller.setSelectedCredentialIds([credentials[0].id]);

    const presentation = await controller.createPresentation();

    expect(presentation).toEqual([]);
  });
});
