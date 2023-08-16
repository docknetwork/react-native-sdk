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
  let selectedCredentialIds: string[] = [];
  let selectedAttributes = [];
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

  async function start({template}: {template: string}) {
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
    selectedDID = dids[0].id;
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
      });

      filteredCredentials = result.verifiableCredential;
    } catch (err) {
      setState(VerificationStatus.Error);
      throw err;
    }
  }

  function getPresentationDefinition() {
    return templateJSON.request;
  }

  function setSelectedCredentialIds(_credentialIds: string[]) {
    selectedCredentialIds = _credentialIds;
  }

  function selectCredentialAttribute(
    credentialId: string,
    attributePath: string,
  ) {}

  async function createPresentation() {
    assert(!!selectedDID, 'No DID selected');
    assert(!!selectedCredentialIds.length, 'No credentials selected');
    assert(!!filteredCredentials.length, 'No filtered credentials found');

    if (isRangeProofTemplate(templateJSON)) {
      // TODO: Implement proving key usage for range-proofs
      assert(!!provingKey, 'No proving key found');
    }

    const credentials = filteredCredentials.filter(credential => {
      return selectedCredentialIds.includes(credential.id);
    });

    const didKeyPairList = await didProvider.getDIDKeyPairs();
    const keyDoc = didKeyPairList.find(doc => doc.id === selectedDID);

    assert(keyDoc, `No key pair found for the selected DID ${selectedDID}`);

    const presentation = await credentialServiceRPC.createPresentation({
      credentials,
      challenge: templateJSON.nonce,
      keyDoc: selectedDID,
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

  function getSelectedCredentialIds() {
    return selectedCredentialIds;
  }

  function getSelectedCredentials() {
    return filteredCredentials.filter(credential => {
      return selectedCredentialIds.includes(credential.id);
    });
  }

  function getSelectedAttributes() {
    return selectedAttributes;
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

  return {
    emitter,
    getStatus,
    getStatusData,
    getSelectedDID() {
      return selectedDID;
    },
    setSelectedDID,
    start,
    loadCredentials,
    getSelectedAttributes,
    getFilteredCredentials,
    getSelectedCredentials,
    setSelectedCredentialIds,
    getSelectedCredentialIds,
    selectCredentialAttribute,
    createPresentation,
    getTemplateJSON() {
      return templateJSON;
    },
  };
}
