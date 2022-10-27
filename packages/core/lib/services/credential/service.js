import {serviceName, validation} from './config';
import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import {getKeypairFromDoc} from '@docknetwork/wallet/methods/keypairs';
import {getSuiteFromKeyDoc} from '@docknetwork/sdk/utils/vc/helpers';
import VerifiablePresentation from '@docknetwork/sdk/verifiable-presentation';
import dock from '@docknetwork/sdk';
import {
  DockResolver,
  DIDKeyResolver,
  MultiResolver,
  UniversalResolver,
} from '@docknetwork/sdk/resolver';
import {verifyCredential} from '@docknetwork/sdk/utils/vc/credentials';

const resolvers = {
  dock: new DockResolver(dock),
  key: new DIDKeyResolver(),
};
const resolver = new MultiResolver(
  resolvers,
  new UniversalResolver('https://uniresolver.io'),
);

class CredentialService {
  constructor() {
    this.name = serviceName;
  }
  rpcMethods = [
    CredentialService.prototype.generateCredential,
    CredentialService.prototype.signCredential,
    CredentialService.prototype.createPresentation,
    CredentialService.prototype.verifyCredential,
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
    const kp = getKeypairFromDoc(keyDoc);
    kp.signer = kp.signer();
    const suite = getSuiteFromKeyDoc(kp);
    vp.setHolder(keyDoc.controller);
    return vp.sign(suite, challenge, domain);
  }
  verifyCredential(params) {
    validation.verifyCredential(params);
    const {credential} = params;
    return verifyCredential(credential, {resolver, revocationApi: {dock}});
  }
}

export const credentialService = new CredentialService();
