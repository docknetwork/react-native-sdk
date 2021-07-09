import dock, { PublicKeySr25519 } from "@docknetwork/sdk";
import {
  createNewDockDID,
  createKeyDetail,
  createSignedDidRemoval,
  createSignedKeyUpdate,
} from "@docknetwork/sdk/utils/did";
import { getPublicKeyFromKeyringPair } from "@docknetwork/sdk/utils/misc";
import {DockResolver} from '@docknetwork/sdk/resolver';
import {
  KeyringPairDidKeys,
  OneOfPolicy,
  getDockRevIdFromCredential,
  DockRevRegQualifier,
  RevRegType,
} from '@docknetwork/sdk/utils/revocation';

import getKeyDoc from '@docknetwork/sdk/utils/vc/helpers';
import {
  issueCredential,
  verifyCredential,
  expandJSONLD,
} from '@docknetwork/sdk/utils/vc/index';
import {randomAsHex} from '@polkadot/util-crypto';

import { getCurrentPair } from "./keyring";

let isDockReady = false;

const resolver = new DockResolver(dock);

// hardcoded registry for testing
const registryId =
  '0x99bfe2629e7e62928b799a54ccfded19c9b88ed98f032569fffcef6ca82241b5';

function addRevRegIdToCred(cred, regId) {
  return {
    ...cred,
    credentialStatus: {
      id: `${DockRevRegQualifier}${regId}`,
      type: RevRegType,
    },
  };
}

export async function ensureDockReady() {
  if (isDockReady) {
    return;
  }

  return new Promise((resolve) => {
    const checkDockRedy = () => {
      if (isDockReady) {
        return resolve();
      }

      setTimeout(checkDockRedy, 200);
    };

    checkDockRedy();
  });
}

export class DockService {
  static async createDID() {
    const pair = getCurrentPair();
    const dockDID = createNewDockDID();
    const publicKey = PublicKeySr25519.fromKeyringPair(pair);
    // The controller is same as the DID
    const keyDetail = createKeyDetail(publicKey, dockDID);
    try {
      await dock.did.new(dockDID, keyDetail, false);
      const didDocument = await dock.did.getDocument(dockDID);
      return didDocument;
    } catch (err) {
      // Fallback
      return {
        "@context": "https://www.w3.org/ns/did/v1",
        id: dockDID,
        authentication: [dockDID + "#keys-1"],
        assertionMethod: [dockDID + "#keys-1"],
        publicKey: [
          {
            id: dockDID + "#keys-1",
            type: "Sr25519VerificationKey2020",
            controller: dockDID,
            publicKeyBase58: "2cdEpNq1fgWCuBSNkgmnffn7NUYJGxaMt58i72e5Hxfj",
          },
        ],
      };
    }
  }
  
  static async issueCredential(did) {
    const issuerKey = getKeyDoc(did, getCurrentPair(), 'Ed25519VerificationKey2018');

    // // Use the same did for testing
    const credId = randomAsHex(32);
    const holderDID = did;

    let unsignedCred = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://www.w3.org/2018/credentials/examples/v1',
      ],
      id: credId,
      type: ['VerifiableCredential', 'AlumniCredential'],
      issuanceDate: '2020-03-18T19:23:24Z',
      credentialSubject: {
        id: holderDID,
        alumniOf: 'Example University',
      },
    };

    unsignedCred = addRevRegIdToCred(unsignedCred, registryId);

    const credentialDocument = await issueCredential(issuerKey, unsignedCred);

    return credentialDocument
  }
  
  static async verifyCredential(credentialDoc) {
    const result = await verifyCredential(credentialDoc, {resolver});
    return result;
  }
}

export default {
  name: "dock",
  routes: {
    async init(...params) {
      const result = await dock.init(...params);
      isDockReady = true;
      return result;
    },
    async setAccount() {
      return dock.setAccount(getCurrentPair());
    },
    createDID: DockService.createDID,
    issueCredential: DockService.issueCredential,
    verifyCredential: DockService.verifyCredential,
  },
};
