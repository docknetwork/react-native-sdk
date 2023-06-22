import {serviceName, validation} from './config';
import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import {getKeypairFromDoc} from '@docknetwork/universal-wallet/methods/keypairs';
import {getSuiteFromKeyDoc} from '@docknetwork/sdk/utils/vc/helpers';
import VerifiablePresentation from '@docknetwork/sdk/verifiable-presentation';
import BbsPlusPresentation from '@docknetwork/sdk/presentation';
import {verifyCredential} from '@docknetwork/sdk/utils/vc/credentials';
import {PEX} from '@sphereon/pex';
import {keyDocToKeypair} from './utils';
import {dockService, getDock} from '../dock/service';

const pex: PEX = new PEX();

class CredentialService {
  constructor() {
    this.name = serviceName;
  }
  rpcMethods = [
    CredentialService.prototype.generateCredential,
    CredentialService.prototype.signCredential,
    CredentialService.prototype.createPresentation,
    CredentialService.prototype.verifyCredential,
    CredentialService.prototype.createBBSPresentation,
    CredentialService.prototype.deriveVCFromBBSPresentation,
  ];
  generateCredential(params = {}) {
    validation.generateCredential(params);
    const {subject} = params;
    const vc = new VerifiableCredential();

    vc.addType('DockAuthCredential');
    vc.addContext({
      dk: 'https://ld.dock.io/credentials#',
      DockAuthCredential: 'dk:DockAuthCredential',
    });
    if (subject) {
      vc.setSubject(subject);
      vc.addContext({
        state: 'dk:state',
      });
    }
    return vc;
  }
  async signCredential(params) {
    validation.signCredential(params);
    const {vcJson, keyDoc} = params;
    const verifiableCredential = new VerifiableCredential();
    verifiableCredential.setFromJSON(vcJson);
    const kp = getKeypairFromDoc(keyDoc);

    kp.signer = kp.signer();
    const suite = getSuiteFromKeyDoc(kp);
    verifiableCredential.setIssuer(keyDoc.controller);

    await verifiableCredential.sign(suite);

    return verifiableCredential;
  }
  async createPresentation(params) {
    validation.createPresentation(params);
    const {credentials, keyDoc, challenge, id, domain} = params;
    const vp = new VerifiablePresentation(id);
    for (const signedVC of credentials) {
      vp.addCredential(signedVC);
    }
    vp.setHolder(keyDoc.controller);
    keyDoc.keypair = keyDocToKeypair(keyDoc, getDock());
    return vp.sign(keyDoc, challenge, domain, dockService.resolver);
  }
  verifyCredential(params) {
    validation.verifyCredential(params);
    const {credential} = params;
    return verifyCredential(credential, {
      resolver: dockService.resolver,
      revocationApi: {dock: getDock()},
    });
  }

  filterCredentials(params) {
    const {credentials, presentationDefinition, holderDid} = params;
    const result = pex.selectFrom(
      presentationDefinition,
      credentials,
      holderDid,
    );

    return result;
  }

  evaluatePresentation(params) {
    const {presentation, presentationDefinition} = params;
    const result = pex.evaluatePresentation(
      presentationDefinition,
      presentation,
    );

    return result;
  }

  async createBBSPresentation(params) {
    validation.createBBSPresentation(params);
    const {credentials} = params;

    const bbsPlusPresentation = new BbsPlusPresentation();
    for (const {credential, attributesToReveal} of credentials) {
      const idx = await bbsPlusPresentation.addCredentialToPresent(credential, {
        resolver: dockService.resolver,
      });
      if (Array.isArray(attributesToReveal) && attributesToReveal.length > 0) {
        await bbsPlusPresentation.addAttributeToReveal(idx, attributesToReveal);
      }
    }
    return bbsPlusPresentation.createPresentation();
  }
  async deriveVCFromBBSPresentation(params) {
    validation.deriveVCFromBBSPresentation(params);
    const {credentials, options = {}} = params;
    const bbsPlusPresentation = new BbsPlusPresentation();
    for (const {credential, attributesToReveal} of credentials) {
      const idx = await bbsPlusPresentation.addCredentialToPresent(credential, {
        resolver: dockService.resolver,
      });
      if (Array.isArray(attributesToReveal) && attributesToReveal.length > 0) {
        await bbsPlusPresentation.addAttributeToReveal(idx, attributesToReveal);
      }
    }
    const credentialsFromPresentation =
      await bbsPlusPresentation.deriveCredentials(options);
    return credentialsFromPresentation.map(credentialJSON => {
      const {credentialSubject} = credentialJSON;
      let customContext = {
        bs: 'https://ld.dock.io/bbs-pres-credentials#',
        proofPurpose: 'bs:proofPurpose',
        parsingOptions: 'bs:parsingOptions',
        defaultDecimalPlaces: 'bs:defaultDecimalPlaces',
        useDefaults: 'bs:useDefaults',
        version: 'bs:version',
        defaultMinimumInteger: 'bs:defaultMinimumInteger',
        attributeCiphertexts: 'bs:attributeCiphertexts',
        attributeEqualities: 'bs:attributeEqualities',
        created: 'bs:created',
        nonce: 'bs:nonce',
        proofValue: 'bs:proofValue',
        verificationMethod: 'bs:verificationMethod',
      };
      Object.keys(credentialSubject || {}).forEach(key => {
        if (key.trim() !== 'id') {
          customContext = {
            ...customContext,
            [key]: `bs:${key}`,
          };
        }
      });
      credentialJSON['@context'].push(customContext);
      return VerifiableCredential.fromJSON(credentialJSON);
    });
  }
}

export const credentialService = new CredentialService();
