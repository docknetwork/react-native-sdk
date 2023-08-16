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

export enum VerificationState {
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
}: {
  wallet: IWallet;
  credentialProvider: ICredentialProvider;
}) {
  let emitter = new EventEmitter();
  let templateJSON = null;
  let state = VerificationState.Started;
  /**
   * Extra data to give better context to the current state
   * Can be used to show error messages, or more specific information about the state
   */
  let stateData = null;
  let filteredCredentials = [];
  let selectedCredentialIds: string[] = [];
  let selectedAttributes = [];
  let didKeyPairList = null;
  let selectedDID = null;
  let provingKey = null;

  if (!credentialProvider) {
    credentialProvider = createCredentialProvider({wallet});
  }

  async function fetchProvingKey(templateJSON: any) {
    if (templateJSON.proving_key) {
      setState(VerificationState.FetchingProvingKey);
      try {
        provingKey = await axios
          .get(templateJSON.proving_key)
          .then(res => res.data);
      } catch (err) {
        setState(VerificationState.Error, {
          message: 'failed_to_fetch_proving_key',
        });

        throw err;
      }
    }
  }

  async function setTemplate(template) {
    setState(VerificationState.LoadingTemplate);

    templateJSON = await getJSON(template);

    await fetchProvingKey(templateJSON);
    await loadCredentials();

    setState(VerificationState.SelectingCredentials);
  }

  function setState(_state: VerificationState, _stateData?: any) {
    state = _state;
    stateData = _stateData;
    emitter.emit(_state, stateData);
  }

  async function loadCredentials() {
    setState(VerificationState.Filtering);

    // get wallet credentials and apply pex filter
    const allCredentials = await credentialProvider.getCredentials();

    if (!allCredentials.length) {
      setState(VerificationState.NoCredentialsInTheWallet);
      return;
    }

    try {
      const result = await pexService.filterCredentials({
        credentials: allCredentials,
        presentationDefinition: getPresentationDefinition(),
      });

      filteredCredentials = result.verifiableCredential;
    } catch (err) {
      setState(VerificationState.Error);
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

    const keyDoc = didKeyPairList.find(doc => doc.id === selectedDID);

    assert(keyDoc, `No key doc found for the selected DID ${selectedDID}`);

    const presentation = await credentialServiceRPC.createPresentation({
      credentials,
      challenge: templateJSON.nonce,
      keyDoc: didKeyPairList[0],
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

  function getDIDs() {
    return didKeyPairList;
  }

  function getSelectedAttributes() {
    return selectedAttributes;
  }

  function getState() {
    return state;
  }

  function getStateData() {
    return stateData;
  }

  function getEmitter() {
    return emitter;
  }

  return {
    getEmitter,
    getState,
    getStateData,
    setTemplate,
    loadCredentials,
    getSelectedAttributes,
    getFilteredCredentials,
    getDIDs,
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

export function createVerificationProvider({wallet}) {
  return {
    start: async ({template}) => {
      const controller = createVerificationController({
        wallet,
        credentialProvider: createCredentialProvider({wallet}),
      });

      await controller.setTemplate(template);

      return controller;
    },
  };
}
