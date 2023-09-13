import {getJSON} from './helpers';
import {pexService} from '@docknetwork/wallet-sdk-wasm/src/services/pex';
import {credentialServiceRPC} from '@docknetwork/wallet-sdk-wasm/src/services/credential';
import {
  createCredentialProvider,
  ICredentialProvider,
} from './credential-provider';
import {IWallet} from './types';
import {EventEmitter} from 'events';
import axios from 'axios';
import assert from 'assert';
import {createDIDProvider, IDIDProvider} from './did-provider';

export enum VerificationStatus {
  Started = 'Started',
  LoadingTemplate = 'LoadingTemplate',
  Filtering = 'Filtering',
  FetchingProvingKey = 'FetchingProvingKey',
  Error = 'Error',
  NoCredentialsInTheWallet = 'NoCredentialsInTheWallet',
  SelectingCredentials = 'SelectingCredentials',
}

function isRangeProofTemplate(templateJSON) {
  return templateJSON.proving_key;
}

type CredentialId = string;
type CredentialSelection = {
  credential: any;
  attributesToReveal?: string[];
};
type CredentialSelectionMap = Map<CredentialId, CredentialSelection>;

export function createVerificationController({
  wallet,
  credentialProvider,
  didProvider,
}: {
  wallet: IWallet;
  credentialProvider?: ICredentialProvider;
  didProvider?: IDIDProvider;
}) {
  const emitter = new EventEmitter();
  let templateJSON = null;
  let status = VerificationStatus.Started;
  /**
   * Extra data to give better context to the current state
   * Can be used to show error messages, or more specific information about the state
   */
  let statusData = null;
  let filteredCredentials = [];
  let selectedCredentials: CredentialSelectionMap = new Map();
  let selectedDID = null;
  let provingKey = null;

  if (!credentialProvider) {
    credentialProvider = createCredentialProvider({wallet});
  }

  if (!didProvider) {
    didProvider = createDIDProvider({wallet});
  }

  async function fetchProvingKey(templateJSON: any) {
    if (templateJSON.proving_key) {
      setState(VerificationStatus.FetchingProvingKey);
      try {
        provingKey = await axios
          .get(templateJSON.proving_key)
          .then(res => res.data);
      } catch (err) {
        setState(VerificationStatus.Error, {
          message: 'failed_to_fetch_proving_key',
        });

        throw err;
      }
    }
  }

  async function start({template}: {template: string | any}) {
    setState(VerificationStatus.LoadingTemplate);

    // check for dids
    const dids = await didProvider.getAll();

    if (!dids.length) {
      setState(VerificationStatus.Error, {
        message: 'no_dids_in_the_wallet',
      });
      throw new Error('No DIDs in the wallet');
    }

    // the application needs to verify if there are more DIDs available, and allow the user to change this selection before creating a presentation
    selectedDID = dids[0].didDocument.id;
    templateJSON = await getJSON(template);

    await fetchProvingKey(templateJSON);
    await loadCredentials();

    setState(VerificationStatus.SelectingCredentials);
  }

  function setState(_status: VerificationStatus, data?: any) {
    status = _status;
    statusData = data;
    emitter.emit(_status, data);
  }

  async function loadCredentials() {
    setState(VerificationStatus.Filtering);

    // get wallet credentials and apply pex filter
    const allCredentials = await credentialProvider.getCredentials();

    if (!allCredentials.length) {
      setState(VerificationStatus.NoCredentialsInTheWallet);
      return;
    }

    try {
      const result = await pexService.filterCredentials({
        credentials: allCredentials,
        presentationDefinition: getPresentationDefinition(),
        holderDIDs: [],
      });

      filteredCredentials = result.verifiableCredential;
    } catch (err) {
      console.error(
        `Unable to filter credentials using the template: \n ${JSON.stringify(
          templateJSON,
          null,
          2,
        )}`,
      );
      console.error(err);

      setState(VerificationStatus.Error);
      throw err;
    }
  }

  function getPresentationDefinition() {
    return templateJSON.request;
  }

  async function isBBSPlusCredential(credential) {
    return credentialServiceRPC.isBBSPlusCredential({credential});
  }

  async function createPresentation() {
    assert(!!selectedDID, 'No DID selected');
    assert(!!selectedCredentials.size, 'No credentials selected');
    assert(!!filteredCredentials.length, 'No filtered credentials found');

    if (isRangeProofTemplate(templateJSON)) {
      // TODO: Implement proving key usage for range-proofs
      assert(!!provingKey, 'No proving key found');
    }

    const credentials = [];

    for (const credentialSelection of selectedCredentials.values()) {
      const isBBS = await isBBSPlusCredential(credentialSelection.credential);

      if (!isBBS) {
        credentials.push(credentialSelection.credential);
      } else {
        console.log('Creating derived credential');
        // derive BBS credential
        const derivedCredentials =
          await credentialServiceRPC.deriveVCFromBBSPresentation({
            credentials: [
              {
                credential: credentialSelection.credential,
                attributesToReveal: [
                  ...(credentialSelection.attributesToReveal || []),
                  'id',
                ],
              },
            ],
          });

        console.log('Credential derived');

        credentials.push(derivedCredentials[0]);
      }
    }

    const didKeyPairList = await didProvider.getDIDKeyPairs();
    const keyDoc = didKeyPairList.find(doc => doc.controller === selectedDID);

    assert(keyDoc, `No key pair found for the selected DID ${selectedDID}`);

    // TODO: Figure out why this context is being created
    delete credentials[0].proof.context;

    const presentation = await credentialServiceRPC.createPresentation({
      credentials,
      challenge: templateJSON.nonce,
      keyDoc,
      id: keyDoc.controller.startsWith('did:key:')
        ? keyDoc.id
        : `${keyDoc.controller}#keys-1`,
      domain: 'dock.io',
    });

    return presentation;
  }

  /**
   * Filtered credentials
   */
  function getFilteredCredentials() {
    return filteredCredentials;
  }

  function getStatus() {
    return status;
  }

  function getStatusData() {
    return statusData;
  }

  function setSelectedDID(did: string) {
    selectedDID = did;
  }

  /**
   * Use pex to evaluate presentation
   *
   * @param presentation
   */
  function evaluatePresentation(presentation) {
    const definition = getPresentationDefinition();
    const result = credentialServiceRPC.evaluatePresentation({
      presentation,
      presentationDefinition: definition,
    });

    return {
      isValid: result.errors.length === 0,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  return {
    emitter,
    selectedCredentials,
    getStatus,
    getStatusData,
    getSelectedDID() {
      return selectedDID;
    },
    setSelectedDID,
    start,
    isBBSPlusCredential,
    loadCredentials,
    getFilteredCredentials,
    createPresentation,
    evaluatePresentation,
    getTemplateJSON() {
      return templateJSON;
    },
  };
}
