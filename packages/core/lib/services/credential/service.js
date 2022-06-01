import {serviceName, validation} from './config';
import VerifiableCredential from '@docknetwork/sdk/verifiable-credential';
import {getKeypairFromDoc} from '@docknetwork/wallet/methods/keypairs';
import {getSuiteFromKeyDoc} from '@docknetwork/sdk/utils/vc/helpers';

class CredentialService {
  constructor() {
    this.name = serviceName;
  }
  rpcMethods = [
    CredentialService.prototype.generateCredential,
    CredentialService.prototype.signCredential,
  ];
  generateCredential(params = {}) {
    validation.generateCredential(params);
    const {subject} = params;
    const vc = new VerifiableCredential();
    vc.addType('DockAuthCredential');
    if (subject) {
      vc.setSubject(subject);
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
}

export const credentialService = new CredentialService();
