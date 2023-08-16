export function createVerificationController({wallet}) {
  let templateJSON = null;
  let credentials = [];
  let selectedCredentials = [];
  let selectedAttributes = [];
  let didKeyPair = null;

  function setTemplate(template) {
    // TODO: fetch URL data
    templateJSON = template;
  }

  function loadCredentials() {
    // get wallet credentials and apply pex filter
  }

  function selectCredential(credentialId: string) {

  }

  function selectCredentialAttribute(credentialId: string, attributePath: string) {

  }

  function createPresentation() {
    // for the given credential selection
    // it will create a presentation
  }

  return {
    setTemplate,
    loadCredentials,
    selectCredential,
    selectCredentialAttribute,
    createPresentation,
  };
}

export function createVerificationProvider({wallet}) {
  return {
    start: ({template}) => {
      const controller = createVerificationController({
        wallet,
      });

      controller.setTemplate(template);

      return controller;
    },
  };
}
